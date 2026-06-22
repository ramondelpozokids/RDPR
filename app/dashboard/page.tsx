// app/(dashboard)/page.tsx
import { prisma }         from "@/lib/prisma/client"
import { getActiveCompanyContext } from "@/lib/company/context"
import { formatCurrency, formatDate, INVOICE_STATUS_LABELS } from "@/lib/utils"
import { StatCard }       from "@/components/ui/StatCard"
import { Users, FolderKanban, FileText, TrendingUp, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

async function getStats(companyId: string) {
  const now       = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [customers, activeProjects, invoices, paidMonthAggregate, recentCustomers] = await Promise.all([
    prisma.customer.count({ where: { companyId } }),
    prisma.project.count({ where: { companyId, status: "IN_PROGRESS" } }),
    prisma.invoice.findMany({
      where:  { companyId },
      select: { total: true, status: true, number: true, issueDate: true, id: true, customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.invoice.aggregate({
      where:  { companyId, status: "PAID", paidAt: { gte: monthStart } },
      _sum:   { total: true },
    }),
    prisma.customer.findMany({
      where:   { companyId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, pipelineStage: true, createdAt: true },
    }),
  ])

  const pendingInvoices = invoices.filter(i => i.status === "PENDING")
  const pendingAmount   = pendingInvoices.reduce((s, i) => s + i.total, 0)

  return {
    totalCustomers:  customers,
    activeProjects,
    pendingInvoices: pendingInvoices.length,
    pendingAmount,
    paidThisMonth:   paidMonthAggregate._sum.total ?? 0,
    recentInvoices:  invoices,
    recentCustomers,
  }
}

const PIPELINE_COLORS: Record<string, string> = {
  NEW_CONTACT: "badge-blue",
  QUOTE_SENT:  "badge-yellow",
  CLIENT_WON:  "badge-green",
  CLIENT_LOST: "badge-gray",
}
const PIPELINE_LABELS: Record<string, string> = {
  NEW_CONTACT: "Nuevo",
  QUOTE_SENT:  "Presupuesto",
  CLIENT_WON:  "Ganado",
  CLIENT_LOST: "Perdido",
}
const INV_COLORS: Record<string, string> = {
  PENDING:  "badge-yellow",
  PAID:     "badge-green",
  OVERDUE:  "badge-red",
  CANCELLED:"badge-gray",
}

export default async function DashboardPage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) {
    return (
      <div className="card text-center py-16">
        <p className="text-text-secondary text-sm">No tienes ninguna empresa asociada.</p>
        <Link href="/register" className="btn-primary inline-flex mt-4">Crear empresa</Link>
      </div>
    )
  }

  const stats = await getStats(ctx.companyId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Inicio</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {ctx.company.name}
            {ctx.organization && ctx.companies.length > 1 && (
              <span className="text-text-muted"> · {ctx.organization.name}</span>
            )}
            {" · "}Bienvenido de vuelta
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/invoices/new" className="btn-secondary hidden sm:inline-flex">
            <Plus size={14} />
            Factura
          </Link>
          <Link href="/dashboard/crm/new" className="btn-primary hidden sm:inline-flex">
            <Plus size={14} />
            Cliente
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clientes totales"
          value={stats.totalCustomers}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />
        <StatCard
          label="Proyectos activos"
          value={stats.activeProjects}
          icon={FolderKanban}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Facturas pendientes"
          value={stats.pendingInvoices}
          icon={FileText}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Importe pendiente"
          value={formatCurrency(stats.pendingAmount)}
          icon={TrendingUp}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent invoices */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h3>Últimas facturas</h3>
            <Link href="/dashboard/invoices" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-text-muted">Sin facturas todavía</p>
              <Link href="/dashboard/invoices/new" className="btn-primary inline-flex mt-3 text-xs">
                <Plus size={13} /> Nueva factura
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {stats.recentInvoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted/50 transition-colors">
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

        {/* Recent customers */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h3>Clientes recientes</h3>
            <Link href="/dashboard/crm" className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
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
              {stats.recentCustomers.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/dashboard/crm/${c.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-brand-700 text-xs font-bold">{c.name.slice(0,2).toUpperCase()}</span>
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

      {/* Quick actions mobile */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {[
          { href: "/dashboard/crm/new",      label: "Nuevo cliente",   emoji: "👤" },
          { href: "/dashboard/projects/new", label: "Nuevo proyecto",  emoji: "📁" },
          { href: "/dashboard/invoices/new", label: "Nueva factura",   emoji: "🧾" },
          { href: "/dashboard/documents",    label: "Subir documento", emoji: "📄" },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="card py-4 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{emoji}</span>
            <p className="text-xs font-medium text-text-primary mt-2">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
