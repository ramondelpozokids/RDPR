// app/(dashboard)/invoices/page.tsx
import { prisma }  from "@/lib/prisma/client"
import { auth }    from "@/lib/auth/config"
import { formatDate, formatCurrency, INVOICE_STATUS_LABELS } from "@/lib/utils"
import { FilePlus } from "lucide-react"
import Link from "next/link"
import InvoiceActions from "./InvoiceActions"

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "badge-yellow",
  PAID:      "badge-green",
  OVERDUE:   "badge-red",
  CANCELLED: "badge-gray",
}

export default async function InvoicesPage() {
  const session = await auth()
  const uc      = await prisma.userCompany.findFirst({
    where: { userId: session!.user!.id as string },
    select: { companyId: true },
  })

  const invoices = uc
    ? await prisma.invoice.findMany({
        where:   { companyId: uc.companyId },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
      })
    : []

  const totalPending = invoices.filter(i => i.status === "PENDING").reduce((s, i) => s + i.total, 0)
  const totalPaid    = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Facturación</h1>
          <p className="text-sm text-text-secondary mt-0.5">{invoices.length} facturas</p>
        </div>
        <Link href="/dashboard/invoices/new" className="btn-primary">
          <FilePlus size={15} />
          Nueva factura
        </Link>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="card py-3">
            <p className="text-xs text-text-secondary mb-1">Pendiente de cobro</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-text-muted mt-0.5">{invoices.filter(i=>i.status==="PENDING").length} facturas</p>
          </div>
          <div className="card py-3">
            <p className="text-xs text-text-secondary mb-1">Cobrado</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-text-muted mt-0.5">{invoices.filter(i=>i.status==="PAID").length} facturas</p>
          </div>
          <div className="card py-3">
            <p className="text-xs text-text-secondary mb-1">Vencido</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
            <p className="text-xs text-text-muted mt-0.5">{invoices.filter(i=>i.status==="OVERDUE").length} facturas</p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <FilePlus size={20} className="text-brand-400" />
          </div>
          <p className="font-medium text-text-primary mb-1">Sin facturas todavía</p>
          <p className="text-sm text-text-muted mb-4">Crea tu primera factura y descárgala en PDF</p>
          <Link href="/dashboard/invoices/new" className="btn-primary inline-flex">
            Crear primera factura
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-muted">
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Número</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Cliente</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden md:table-cell">Vence</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Total</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-text-primary">
                    {inv.number}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/crm/${inv.customer.id}`}
                      className="text-text-primary hover:text-brand-600 transition-colors font-medium"
                    >
                      {inv.customer.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-secondary hidden sm:table-cell">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="px-5 py-3 text-text-secondary hidden md:table-cell">
                    {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold text-text-primary">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={STATUS_COLORS[inv.status]}>
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <InvoiceActions invoiceId={inv.id} currentStatus={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
