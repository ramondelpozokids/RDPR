// app/(dashboard)/crm/[id]/page.tsx
import { prisma }  from "@/lib/prisma/client"
import { auth }    from "@/lib/auth/config"
import { notFound } from "next/navigation"
import { formatDate, formatCurrency, PIPELINE_LABELS, PROJECT_STATUS_LABELS, INVOICE_STATUS_LABELS } from "@/lib/utils"
import Link from "next/link"
import CustomerEditForm from "./CustomerEditForm"
import { ArrowLeft, Mail, Phone, MapPin, FileText, FolderKanban } from "lucide-react"

const INVOICE_STATUS_COLORS: Record<string, string> = {
  PENDING:   "badge-yellow",
  PAID:      "badge-green",
  OVERDUE:   "badge-red",
  CANCELLED: "badge-gray",
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  PENDING:     "badge-gray",
  IN_PROGRESS: "badge-blue",
  COMPLETED:   "badge-green",
  CANCELLED:   "badge-red",
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const uc      = await prisma.userCompany.findFirst({
    where: { userId: session!.user!.id as string },
    select: { companyId: true },
  })
  if (!uc) return notFound()

  const customer = await prisma.customer.findFirst({
    where:   { id: params.id, companyId: uc.companyId },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, include: { items: true } },
    },
  })
  if (!customer) return notFound()

  const totalFacturado = customer.invoices
    .filter(i => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0)

  const totalPendiente = customer.invoices
    .filter(i => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.total, 0)

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/crm" className="text-text-muted hover:text-text-primary mt-1 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
              {customer.name.slice(0,2).toUpperCase()}
            </div>
            <div>
              <h1>{customer.name}</h1>
              {customer.taxId && (
                <p className="text-sm text-text-secondary">NIF/CIF: {customer.taxId}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Info + Edit */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact card */}
          <div className="card space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contacto</h3>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-text-muted shrink-0" />
                <a href={`mailto:${customer.email}`} className="text-brand-600 hover:underline truncate">
                  {customer.email}
                </a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-text-muted shrink-0" />
                <a href={`tel:${customer.phone}`} className="text-text-primary hover:text-brand-600">
                  {customer.phone}
                </a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-text-muted shrink-0 mt-0.5" />
                <span className="text-text-secondary">
                  {[customer.address, customer.city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            <div className="pt-1">
              <span className={
                customer.pipelineStage === "CLIENT_WON"   ? "badge-green"  :
                customer.pipelineStage === "CLIENT_LOST"  ? "badge-gray"   :
                customer.pipelineStage === "QUOTE_SENT"   ? "badge-yellow" : "badge-blue"
              }>
                {PIPELINE_LABELS[customer.pipelineStage]}
              </span>
            </div>
            {customer.notes && (
              <div className="text-xs text-text-secondary bg-surface-muted rounded-lg p-3 mt-2 leading-relaxed">
                {customer.notes}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Cliente desde</span>
                <span className="font-medium">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Proyectos</span>
                <span className="font-medium">{customer.projects.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Facturado</span>
                <span className="font-medium text-emerald-600">{formatCurrency(totalFacturado)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pendiente</span>
                <span className="font-medium text-amber-600">{formatCurrency(totalPendiente)}</span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <CustomerEditForm customer={customer} />
        </div>

        {/* Right - Projects + Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2">
                <FolderKanban size={16} className="text-text-muted" />
                Proyectos ({customer.projects.length})
              </h3>
              <Link
                href={`/dashboard/projects/new?customerId=${customer.id}`}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                + Nuevo proyecto
              </Link>
            </div>
            {customer.projects.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-text-muted">Sin proyectos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customer.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="card py-3 px-4 flex items-center justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors">
                        {p.name}
                      </p>
                      {p.endDate && (
                        <p className="text-xs text-text-muted mt-0.5">Fin: {formatDate(p.endDate)}</p>
                      )}
                    </div>
                    <span className={PROJECT_STATUS_COLORS[p.status]}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2">
                <FileText size={16} className="text-text-muted" />
                Facturas ({customer.invoices.length})
              </h3>
              <Link
                href={`/dashboard/invoices/new?customerId=${customer.id}`}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                + Nueva factura
              </Link>
            </div>
            {customer.invoices.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-text-muted">Sin facturas</p>
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted">
                      <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Número</th>
                      <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Fecha</th>
                      <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Total</th>
                      <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Estado</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {customer.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-muted/50">
                        <td className="px-4 py-3 font-mono text-xs font-medium">{inv.number}</td>
                        <td className="px-4 py-3 text-text-secondary">{formatDate(inv.issueDate)}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(inv.total)}</td>
                        <td className="px-4 py-3">
                          <span className={INVOICE_STATUS_COLORS[inv.status]}>
                            {INVOICE_STATUS_LABELS[inv.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            className="text-xs text-brand-600 hover:underline font-medium"
                          >
                            PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
