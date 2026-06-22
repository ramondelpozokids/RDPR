import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { formatCurrency } from "@/lib/utils"

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      status: { not: "CANCELLED" },
    },
    orderBy: { issueDate: "desc" },
    take: 24,
  })

  const paid = invoices.filter((i) => i.status === "PAID")
  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE")

  const totalPaid = paid.reduce((s, i) => s + i.total, 0)
  const totalPending = pending.reduce((s, i) => s + i.total, 0)
  const totalVat = invoices.reduce((s, i) => s + i.taxAmount, 0)

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalPaid,
        totalPending,
        totalVat,
        totalPaidLabel: formatCurrency(totalPaid),
        totalPendingLabel: formatCurrency(totalPending),
        totalVatLabel: formatCurrency(totalVat),
        invoiceCount: invoices.length,
      },
      invoices: invoices.map((i) => ({
        id: i.id,
        number: i.number,
        issueDate: i.issueDate,
        total: i.total,
        status: i.status,
        taxAmount: i.taxAmount,
      })),
      note: "Resumen orientativo de su expediente. Los modelos AEAT los gestiona su asesoría en RDPR OS.",
    },
  })
}
