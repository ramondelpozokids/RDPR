import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, formatCurrency, INVOICE_STATUS_LABELS } from "@/lib/utils"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"
import { FilePlus, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import InvoiceActions from "./InvoiceActions"
import { MetricCard } from "@/components/ui/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const STATUS_BADGE: Record<string, "warning" | "success" | "destructive" | "muted"> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "muted",
}

export default async function InvoicesPage() {
  const companyId = await getActiveCompanyId()

  if (companyId) await syncOverdueInvoices(companyId)

  const invoices = companyId
    ? await prisma.invoice.findMany({
        where: { companyId },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
      })
    : []

  const totalPending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0)
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Facturación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{invoices.length} facturas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <FilePlus size={15} />
            Nueva factura
          </Link>
        </Button>
      </div>

      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <MetricCard
            label="Pendiente de cobro"
            value={formatCurrency(totalPending)}
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            label="Cobrado"
            value={formatCurrency(totalPaid)}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <MetricCard
            label="Vencido"
            value={formatCurrency(totalOverdue)}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
        </div>
      )}

      {overdueCount > 0 && (
        <Card className="mb-6 p-4 border-red-200 bg-red-50/50">
          <p className="text-sm text-red-800">
            <strong>{overdueCount} factura(s) vencida(s)</strong> — usa &quot;Enviar recordatorio&quot; en el menú de
            acciones para contactar al cliente.
          </p>
        </Card>
      )}

      {invoices.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
            <FilePlus size={20} className="text-primary" />
          </div>
          <p className="font-medium text-foreground mb-1">Sin facturas todavía</p>
          <p className="text-sm text-muted-foreground mb-4">Crea tu primera factura y descárgala en PDF</p>
          <Button asChild>
            <Link href="/dashboard/invoices/new">Crear primera factura</Link>
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Número</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden md:table-cell">Vence</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Total</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => {
                const isDueSoon =
                  inv.status === "PENDING" &&
                  inv.dueDate &&
                  inv.dueDate.getTime() - Date.now() < 7 * 86400000 &&
                  inv.dueDate >= new Date()
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{inv.number}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/crm/${inv.customer.id}`}
                        className="text-foreground hover:text-primary transition-colors font-medium"
                      >
                        {inv.customer.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      {inv.dueDate ? (
                        <span
                          className={
                            inv.status === "OVERDUE"
                              ? "text-red-600 font-medium"
                              : isDueSoon
                                ? "text-amber-600"
                                : "text-muted-foreground"
                          }
                        >
                          {formatDate(inv.dueDate)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-foreground">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_BADGE[inv.status]}>{INVOICE_STATUS_LABELS[inv.status]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <InvoiceActions
                        invoiceId={inv.id}
                        currentStatus={inv.status}
                        customerEmail={inv.customer.email}
                        reminderSentAt={inv.reminderSentAt?.toISOString() ?? null}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
