import { prisma } from "@/lib/prisma/client"
import type { Prisma } from "@prisma/client"
import { submitVerifactuToAeat } from "@/lib/aeat/client"
import { buildVerifactuRecord } from "@/lib/verifactu/record-builder"

export async function registerInvoiceVerifactu(invoiceId: string, companyId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, companyId },
    include: { company: true, customer: true },
  })
  if (!invoice) throw new Error("Factura no encontrada")

  const record = await buildVerifactuRecord(invoice, "ALTA")
  const aeat = await submitVerifactuToAeat({
    companyId,
    invoiceId,
    recordType: record.recordType,
    hash: record.hash,
    previousHash: record.previousHash,
    qrPayload: record.qrPayload,
    issuerTaxId: invoice.company.taxId ?? "",
    invoiceNumber: invoice.number,
    total: invoice.total,
  })

  const now = new Date()
  const status = aeat.status === "ACCEPTED" ? "ACCEPTED" : "REJECTED"

  const entry = await prisma.verifactuRegistryEntry.upsert({
    where: { invoiceId },
    create: {
      companyId,
      invoiceId,
      recordType: record.recordType,
      hash: record.hash,
      previousHash: record.previousHash,
      qrPayload: record.qrPayload,
      aeatCsv: aeat.csv,
      status,
      submittedAt: now,
      rejectionReason: aeat.rejectionReason,
      responsePayload: aeat.responsePayload as Prisma.InputJsonValue,
    },
    update: {
      hash: record.hash,
      previousHash: record.previousHash,
      qrPayload: record.qrPayload,
      aeatCsv: aeat.csv,
      status,
      submittedAt: now,
      rejectionReason: aeat.rejectionReason,
      responsePayload: aeat.responsePayload as Prisma.InputJsonValue,
    },
  })

  const electronicStatus = status === "ACCEPTED" ? "REGISTERED" : "REJECTED"
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      complianceHash: record.hash,
      electronicStatus,
      electronicFormat: invoice.electronicFormat ?? "FACTURAE_3_2",
    },
  })

  return { entry, aeat }
}
