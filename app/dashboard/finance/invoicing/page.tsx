import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, formatCurrency, INVOICE_STATUS_LABELS } from "@/lib/utils"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"
import { formatComplianceHashShort } from "@/lib/efactura/compliance-hash"
import { FilePlus, Clock, CheckCircle2, AlertTriangle, FileCheck2 } from "lucide-react"
import Link from "next/link"
import InvoiceActions from "@/app/dashboard/invoices/InvoiceActions"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RDPR_EFACTURA_TAGLINE } from "@/lib/finance/structure"

const STATUS_BADGE: Record<string, "warning" | "success" | "destructive" | "muted"> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "muted",
}

const E_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  SIGNED: "Firmada",
  SENT: "Enviada",
  REGISTERED: "Registrada",
  REJECTED: "Rechazada",
}

export default async function InvoicingPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  await syncOverdueInvoices(companyId)

  const invoices = await prisma.invoice.findMany({
    where: { companyId, documentType: "INVOICE" },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  })

  const totalPending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0)
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length
  const eSent = invoices.filter((i) => i.electronicStatus === "SENT" || i.electronicStatus === "REGISTERED").length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Facturación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            RDPR Finance · {invoices.length} factura(s) · {RDPR_EFACTURA_TAGLINE}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/finance/efactura">
              <FileCheck2 size={15} />
              eFactura
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/finance/invoicing/new">
              <FilePlus size={15} />
              Nueva factura
            </Link>
          </Button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Pendiente de cobro" value={formatCurrency(totalPending)} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <MetricCard label="Cobrado" value={formatCurrency(totalPaid)} icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <MetricCard label="Vencido" value={formatCurrency(totalOverdue)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
          <MetricCard label="Envío electrónico" value={String(eSent)} icon={FileCheck2} iconColor="text-violet-600" iconBg="bg-violet-50" />
        </div>
      )}

      {overdueCount > 0 && (
        <Card className="mb-6 p-4 border-red-200 bg-red-50/50">
          <p className="text-sm text-red-800">
            <strong>{overdueCount} factura(s) vencida(s)</strong> — envía recordatorio o concilia el cobro en Banca.
          </p>
        </Card>
      )}

      {invoices.length === 0 ? (
        <Card className="text-center py-16">
          <FilePlus size={32} className="text-primary mx-auto mb-3 opacity-60" />
          <p className="font-medium mb-1">Sin facturas todavía</p>
          <p className="text-sm text-muted-foreground mb-4">Emite tu primera factura con huella de cumplimiento y export Facturae</p>
          <Button asChild>
            <Link href="/dashboard/finance/invoicing/new">Crear primera factura</Link>
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Número</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden lg:table-cell">eFactura</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Total</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs font-semibold">{inv.number}</td>
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/crm/${inv.customer.id}`} className="font-medium hover:text-primary">
                      {inv.customer.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <Badge variant="muted">{E_STATUS_LABELS[inv.electronicStatus] ?? inv.electronicStatus}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      {formatComplianceHashShort(inv.complianceHash)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3 font-semibold">{formatCurrency(inv.total)}</td>
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
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
