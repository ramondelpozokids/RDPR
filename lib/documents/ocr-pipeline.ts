import { prisma } from "@/lib/prisma/client"
import { runDocumentOcr } from "@/lib/documents/ocr-vision"
import { assertCanRunOcr } from "@/lib/billing/usage"
import { ensureOcrReviewTask } from "@/lib/crm/auto-tasks"
import { logCustomerActivity } from "@/lib/crm/activity-log"
import type { ExpenseCategory } from "@prisma/client"

function inferCategory(name: string): ExpenseCategory {
  const n = name.toLowerCase()
  if (n.includes("nomina") || n.includes("nómina")) return "SERVICES"
  if (n.includes("alquiler") || n.includes("rent")) return "RENT"
  if (n.includes("banco") || n.includes("comision")) return "BANK_FEES"
  if (n.includes("material") || n.includes("suministro")) return "SUPPLIES"
  return "SERVICES"
}

function isInvoiceLike(name: string, fileType: string): boolean {
  const n = name.toLowerCase()
  return (
    fileType === "application/pdf" ||
    fileType.startsWith("image/") ||
    n.includes("factura") ||
    n.includes("invoice") ||
    n.includes("ticket") ||
    n.includes("recibo")
  )
}

/** Procesa OCR y crea borrador de gasto si aplica. */
export async function processOcrJob(documentId: string) {
  const job = await prisma.ocrJob.findUnique({ where: { documentId } })
  if (!job || job.status === "PROCESSING" || job.status === "COMPLETED") return

  await prisma.ocrJob.update({
    where: { documentId },
    data: { status: "PROCESSING" },
  })

  try {
    const doc = await prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) throw new Error("Documento no encontrado")

    const extraction = await runDocumentOcr(doc.name, doc.fileUrl, doc.fileType)

    await prisma.documentOcrResult.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        rawText: extraction.rawText,
        structured: extraction.structured,
      },
      update: {
        rawText: extraction.rawText,
        structured: extraction.structured,
      },
    })

    if (isInvoiceLike(doc.name, doc.fileType) && extraction.structured.amount) {
      const total = extraction.structured.amount
      const taxRate = extraction.structured.vatRate ?? 21
      const subtotal = extraction.structured.subtotal ?? total / (1 + taxRate / 100)
      const taxAmount = total - subtotal

      await prisma.expenseDraft.upsert({
        where: { documentId: doc.id },
        create: {
          companyId: doc.companyId,
          customerId: doc.customerId,
          documentId: doc.id,
          vendor: extraction.structured.vendor ?? null,
          description: `Gasto detectado: ${doc.name}`,
          issueDate: extraction.structured.date ? new Date(extraction.structured.date) : new Date(),
          subtotal: Math.round(subtotal * 100) / 100,
          taxRate,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          category: inferCategory(doc.name),
          confidence: extraction.structured.confidence,
          status: "PENDING_REVIEW",
        },
        update: {
          vendor: extraction.structured.vendor ?? null,
          subtotal: Math.round(subtotal * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          confidence: extraction.structured.confidence,
        },
      })

      if (doc.category === "GENERAL") {
        await prisma.document.update({
          where: { id: doc.id },
          data: { category: "INVOICE" },
        })
      }

      if (doc.customerId) {
        await ensureOcrReviewTask({
          companyId: doc.companyId,
          customerId: doc.customerId,
          documentId: doc.id,
          documentName: doc.name,
        })
        await logCustomerActivity({
          companyId: doc.companyId,
          customerId: doc.customerId,
          action: "OCR_EXPENSE_DRAFT",
          entity: "ExpenseDraft",
          entityId: doc.id,
          metadata: { documentName: doc.name },
        })
      }
    }

    await prisma.ocrJob.update({
      where: { documentId },
      data: { status: "COMPLETED", processedAt: new Date() },
    })
  } catch (err) {
    await prisma.ocrJob.update({
      where: { documentId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Error OCR",
        processedAt: new Date(),
      },
    })
  }
}

/** Encola y procesa OCR (inline MVP). */
export async function enqueueOcrPipeline(
  documentId: string,
  companyId: string,
  customerId?: string | null
) {
  await assertCanRunOcr(companyId)

  await prisma.ocrJob.upsert({
    where: { documentId },
    create: { documentId, companyId, customerId: customerId ?? undefined, status: "PENDING" },
    update: { status: "PENDING", errorMessage: null },
  })

  void processOcrJob(documentId)
}
