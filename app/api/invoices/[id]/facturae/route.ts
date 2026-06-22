import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { generateFacturaeXml, generateUblXml, validateFacturaeReady } from "@/lib/efactura/export-formats"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const format = new URL(req.url).searchParams.get("format") ?? "facturae"

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, companyId },
    include: { customer: true, items: true, company: true },
  })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const input = {
    invoice: {
      number: invoice.number,
      issueDate: invoice.issueDate,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      complianceHash: invoice.complianceHash,
      items: invoice.items,
    },
    company: invoice.company,
    customer: invoice.customer,
  }

  const validation = validateFacturaeReady(input)
  if (!validation.ok && format === "facturae") {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 })
  }

  const xml = format === "ubl" ? generateUblXml(input) : generateFacturaeXml(input)
  const filename = `${invoice.number}-${format}.xml`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
