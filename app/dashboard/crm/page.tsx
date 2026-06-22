// app/(dashboard)/crm/page.tsx
import { prisma }  from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, PIPELINE_LABELS } from "@/lib/utils"
import { UserPlus } from "lucide-react"
import Link from "next/link"

const STAGE_COLORS: Record<string, string> = {
  NEW_CONTACT:  "badge-blue",
  QUOTE_SENT:   "badge-yellow",
  CLIENT_WON:   "badge-green",
  CLIENT_LOST:  "badge-gray",
}

export default async function CRMPage() {
  const companyId = await getActiveCompanyId()

  const customers = companyId
    ? await prisma.customer.findMany({
        where:   { companyId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { projects: true, invoices: true } } },
      })
    : []

  const ganados   = customers.filter(c => c.pipelineStage === "CLIENT_WON").length
  const perdidos  = customers.filter(c => c.pipelineStage === "CLIENT_LOST").length
  const enCurso   = customers.filter(c => c.pipelineStage === "QUOTE_SENT").length

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>CRM</h1>
          <p className="text-sm text-text-secondary mt-0.5">{customers.length} contactos</p>
        </div>
        <Link href="/dashboard/crm/new" className="btn-primary">
          <UserPlus size={15} />
          Nuevo cliente
        </Link>
      </div>

      {/* Pipeline summary */}
      {customers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total",          value: customers.length, color: "text-text-primary" },
            { label: "Presupuestados", value: enCurso,          color: "text-amber-600"    },
            { label: "Ganados",        value: ganados,          color: "text-emerald-600"  },
            { label: "Perdidos",       value: perdidos,         color: "text-text-muted"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="card py-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {customers.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <UserPlus size={20} className="text-brand-400" />
          </div>
          <p className="font-medium text-text-primary mb-1">Sin clientes todavía</p>
          <p className="text-sm text-text-muted mb-4">Añade tu primer contacto al CRM</p>
          <Link href="/dashboard/crm/new" className="btn-primary inline-flex">
            Añadir primer cliente
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-muted">
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Nombre</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden md:table-cell">Teléfono</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden lg:table-cell">Proyectos</th>
                <th className="text-left px-5 py-3 text-text-secondary font-medium hidden lg:table-cell">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors group">
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/crm/${c.id}`}
                      className="font-medium text-text-primary group-hover:text-brand-600 transition-colors"
                    >
                      {c.name}
                    </Link>
                    {c.taxId && (
                      <p className="text-xs text-text-muted mt-0.5">{c.taxId}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-text-secondary hidden sm:table-cell">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-text-secondary hidden md:table-cell">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={STAGE_COLORS[c.pipelineStage]}>
                      {PIPELINE_LABELS[c.pipelineStage]}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-text-secondary">
                      {c._count.projects} proy · {c._count.invoices} fact
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary hidden lg:table-cell">
                    {formatDate(c.createdAt)}
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
