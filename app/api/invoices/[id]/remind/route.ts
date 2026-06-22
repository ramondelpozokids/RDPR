import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { buildInvoiceReminder } from "@/lib/invoices/reminder"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, companyId },
    include: { customer: true, company: true },
  })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  if (invoice.status === "PAID" || invoice.status === "CANCELLED") {
    return NextResponse.json({ error: "No se puede enviar recordatorio a esta factura" }, { status: 400 })
  }

  if (!invoice.customer.email) {
    return NextResponse.json({ error: "El cliente no tiene email registrado" }, { status: 400 })
  }

  const reminder = buildInvoiceReminder({
    number: invoice.number,
    total: invoice.total,
    dueDate: invoice.dueDate,
    issueDate: invoice.issueDate,
    customer: { name: invoice.customer.name, email: invoice.customer.email },
    company: { name: invoice.company.name, email: invoice.company.email },
  })

  await prisma.invoice.update({
    where: { id: params.id },
    data: { reminderSentAt: new Date() },
  })

  return NextResponse.json({
    success: true,
    data: {
      ...reminder,
      reminderSentAt: new Date().toISOString(),
    },
  })
}
