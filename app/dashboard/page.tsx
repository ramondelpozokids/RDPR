import { getActiveCompanyContext } from "@/lib/company/context"
import { getActiveBrandContext } from "@/lib/brands/context"
import { getExecutiveStats } from "@/lib/dashboard/get-executive-stats"
import { getGestoriaCommandCenter } from "@/lib/gestoria/get-command-center-stats"
import { formatCurrency, formatDate, INVOICE_STATUS_LABELS } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { ExecutiveAlerts } from "@/components/dashboard/ExecutiveAlerts"
import { GestoriaCommandCenter } from "@/components/dashboard/GestoriaCommandCenter"
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart"
import { CompanyBreakdown } from "@/components/dashboard/CompanyBreakdown"
import {
  TrendingUp,
  Wallet,
  Clock,
  Receipt,
  Users,
  FolderKanban,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const PIPELINE_COLORS: Record<string, string> = {
  NEW_CONTACT: "badge-blue",
  QUOTE_SENT: "badge-yellow",
  CLIENT_WON: "badge-green",
  CLIENT_LOST: "badge-gray",
}
const PIPELINE_LABELS: Record<string, string> = {
  NEW_CONTACT: "Nuevo",
  QUOTE_SENT: "Presupuesto",
  CLIENT_WON: "Ganado",
  CLIENT_LOST: "Perdido",
}
const INV_COLORS: Record<string, string> = {
  PENDING: "badge-yellow",
  PAID: "badge-green",
  OVERDUE: "badge-red",
  CANCELLED: "badge-gray",
}

function trendLabel(delta: number | null) {
  if (delta === null) return undefined
  return { value: delta, label: "vs mes anterior" }
}

export default async function DashboardPage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) {
    return (
      <div className="card text-center py-16">
        <p className="text-text-secondary text-sm">No tienes ninguna empresa asociada.</p>
        <Link href="/register" className="btn-primary inline-flex mt-4">
          Crear empresa
        </Link>
      </div>
    )
  }

  const stats = await getExecutiveStats(ctx.companyId, ctx.companies)
  const gestoria = await getGestoriaCommandCenter(ctx.companyId)
  const brandCtx = await getActiveBrandContext()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>Dashboard ejecutivo</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {ctx.company.name}
            {brandCtx?.activeBrand && brandCtx.activeBrand.type !== "MAIN" && (
              <span className="text-text-muted"> · {brandCtx.activeBrand.name}</span>
            )}
            {ctx.organization && ctx.companies.length > 1 && (
              <span className="text-text-muted"> · {ctx.organization.name}</span>
            )}
            {" · "}Resumen financiero
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/finance/invoicing/new">
              <Plus size={14} />
              Factura
            </Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/crm/new">
              <Plus size={14} />
              Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Centro de mando gestoría */}
      <GestoriaCommandCenter data={gestoria} />

      {/* KPIs financieros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Facturado este mes"
          value={formatCurrency(stats.billedMonth)}
          icon={TrendingUp}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          trend={trendLabel(stats.billedMonthDelta)}
        />
        <MetricCard
          label="Cobrado este mes"
          value={formatCurrency(stats.paidMonth)}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={trendLabel(stats.paidMonthDelta)}
        />
        <MetricCard
          label="Pendiente de cobro"
          value={formatCurrency(stats.pendingAmount)}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="IVA trimestre (est.)"
          value={formatCurrency(stats.estimatedVatQuarter)}
          icon={Receipt}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      {/* KPIs operativos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos netos (mes)"
          value={formatCurrency(stats.netRevenueMonth)}
          icon={TrendingUp}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <MetricCard
          label="Vencidas"
          value={stats.overdueCount}
          icon={Clock}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <MetricCard
          label="Clientes"
          value={stats.totalCustomers}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />
        <MetricCard
          label="Proyectos activos"
          value={stats.activeProjects}
          icon={FolderKanban}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Gráfico + alertas / grupo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={stats.monthlyRevenue} />
        </div>
        <ExecutiveAlerts alerts={stats.alerts} />
      </div>

      {stats.companyBreakdown.length > 0 && (
        <CompanyBreakdown rows={stats.companyBreakdown} />
      )}

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h3>Últimas facturas</h3>
            <Link
              href="/dashboard/finance/invoicing"
              className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-text-muted">Sin facturas todavía</p>
              <Link href="/dashboard/finance/invoicing/new" className="btn-primary inline-flex mt-3 text-xs">
                <Plus size={13} /> Nueva factura
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {stats.recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{inv.customer.name}</p>
                    <p className="text-xs text-text-muted font-mono">{inv.number}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(inv.total)}</p>
                    <span className={INV_COLORS[inv.status]}>{INVOICE_STATUS_LABELS[inv.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h3>Clientes recientes</h3>
            <Link
              href="/dashboard/crm"
              className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentCustomers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-text-muted">Sin clientes todavía</p>
              <Link href="/dashboard/crm/new" className="btn-primary inline-flex mt-3 text-xs">
                <Plus size={13} /> Añadir cliente
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {stats.recentCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/crm/${c.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-brand-700 text-xs font-bold">{c.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(c.createdAt)}</p>
                  </div>
                  <span className={PIPELINE_COLORS[c.pipelineStage]}>
                    {PIPELINE_LABELS[c.pipelineStage]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {[
          { href: "/dashboard/crm/new", label: "Nuevo cliente", emoji: "👤" },
          { href: "/dashboard/projects/new", label: "Nuevo proyecto", emoji: "📁" },
          { href: "/dashboard/finance/invoicing/new", label: "Nueva factura", emoji: "🧾" },
          { href: "/dashboard/documents", label: "Subir documento", emoji: "📄" },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href} className="card py-4 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">{emoji}</span>
            <p className="text-xs font-medium text-text-primary mt-2">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
