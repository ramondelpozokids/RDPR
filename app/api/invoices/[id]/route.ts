// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"
import { createInvoicePaymentEntry } from "@/lib/accounting/journal"

// GET /api/invoices/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await syncOverdueInvoices(companyId)

  const invoice = await prisma.invoice.findFirst({
    where:   { id: params.id, companyId },
    include: { customer: true, items: true },
  })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json({ success: true, data: invoice })
}

// PATCH /api/invoices/:id  — cambiar estado
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const schema = z.object({
    status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, companyId } })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.status === "PAID" && !invoice.paidAt ? { paidAt: new Date() } : {}),
    },
    include: { customer: true, items: true },
  })

  if (parsed.data.status === "PAID") {
    await createInvoicePaymentEntry({
      id: updated.id,
      companyId: updated.companyId,
      number: updated.number,
      paidAt: updated.paidAt,
      total: updated.total,
      customer: updated.customer,
    })
  }

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/invoices/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, companyId } })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  await prisma.invoice.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
