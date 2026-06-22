import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { formatCurrency } from "@/lib/utils"
import { getCurrentQuarterPeriod } from "@/lib/tax/periods"
import { MODEL_347_THRESHOLD } from "@/lib/tax/constants"

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const period = getCurrentQuarterPeriod()

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      status: { not: "CANCELLED" },
    },
    orderBy: { issueDate: "desc" },
    take: 24,
  })

  const quarterInvoices = invoices.filter(
    (i) => i.issueDate >= period.start && i.issueDate <= period.end
  )

  const paid = invoices.filter((i) => i.status === "PAID")
  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE")

  const totalPaid = paid.reduce((s, i) => s + i.total, 0)
  const totalPending = pending.reduce((s, i) => s + i.total, 0)
  const totalVat = invoices.reduce((s, i) => s + i.taxAmount, 0)

  const qBase = quarterInvoices.reduce((s, i) => s + i.subtotal, 0)
  const qVat = quarterInvoices.reduce((s, i) => s + i.taxAmount, 0)
  const yearTotal = invoices
    .filter((i) => i.issueDate.getFullYear() === period.year)
    .reduce((s, i) => s + i.total, 0)

  const taxModels = [
    {
      code: "303",
      name: "IVA trimestre",
      period: period.label,
      status: "orientativo",
      amount: qVat,
      amountLabel: formatCurrency(qVat),
      detail: `${formatCurrency(qBase)} base imponible · ${quarterInvoices.length} factura(s)`,
    },
    ...(yearTotal >= MODEL_347_THRESHOLD
      ? [
          {
            code: "347",
            name: "Operaciones con terceros",
            period: `Ejercicio ${period.year}`,
            status: "revisar",
            amount: yearTotal,
            amountLabel: formatCurrency(yearTotal),
            detail: "Importe anual acumulado en su expediente",
          },
        ]
      : []),
  ]

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
      taxModels,
      invoices: invoices.map((i) => ({
        id: i.id,
        number: i.number,
        issueDate: i.issueDate,
        total: i.total,
        status: i.status,
        taxAmount: i.taxAmount,
      })),
      note: "Vista de solo lectura de su expediente. Los modelos oficiales los presenta su asesoría en RDPR OS.",
    },
  })
}
