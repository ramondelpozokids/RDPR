import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { generateComplianceHash } from "@/lib/efactura/compliance-hash"
import { registerInvoiceVerifactu } from "@/lib/verifactu/submit"

const bodySchema = z.object({
  action: z.enum(["sign", "send", "register", "regenerate_hash"]),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Acción inválida" }, { status: 400 })

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, companyId },
    include: { customer: true, company: true },
  })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const now = new Date()
  let data: Record<string, unknown> = {}
  let registry: unknown = null

  switch (parsed.data.action) {
    case "regenerate_hash": {
      const hash = generateComplianceHash({
        number: invoice.number,
        issueDate: invoice.issueDate,
        total: invoice.total,
        taxId: invoice.company.taxId,
        customerTaxId: invoice.customer.taxId,
      })
      data = { complianceHash: hash, electronicFormat: "FACTURAE_3_2" }
      break
    }
    case "sign":
      data = {
        electronicStatus: "SIGNED",
        signedAt: now,
        electronicFormat: invoice.electronicFormat ?? "FACTURAE_3_2",
        ...(invoice.complianceHash
          ? {}
          : {
              complianceHash: generateComplianceHash({
                number: invoice.number,
                issueDate: invoice.issueDate,
                total: invoice.total,
                taxId: invoice.company.taxId,
                customerTaxId: invoice.customer.taxId,
              }),
            }),
      }
      break
    case "send":
      data = {
        electronicStatus: "SENT",
        electronicSentAt: now,
        electronicFormat: invoice.electronicFormat ?? "FACTURAE_3_2",
      }
      break
    case "register": {
      try {
        const result = await registerInvoiceVerifactu(params.id, companyId)
        registry = result.entry
        const updated = await prisma.invoice.findUnique({
          where: { id: params.id },
          include: { customer: true, items: true, verifactuEntry: true },
        })
        return NextResponse.json({ success: true, data: updated, registry: result.entry, aeat: result.aeat })
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Error al registrar en AEAT" },
          { status: 400 }
        )
      }
    }
  }

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data,
    include: { customer: true, items: true, verifactuEntry: true },
  })

  return NextResponse.json({ success: true, data: updated, registry })
}
