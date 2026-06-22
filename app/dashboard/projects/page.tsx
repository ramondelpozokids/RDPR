// app/(dashboard)/projects/page.tsx
import { prisma }  from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, PROJECT_STATUS_LABELS } from "@/lib/utils"
import { FolderPlus } from "lucide-react"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "badge-gray",
  IN_PROGRESS: "badge-blue",
  COMPLETED:   "badge-green",
  CANCELLED:   "badge-red",
}

export default async function ProjectsPage() {
  const companyId = await getActiveCompanyId()

  const projects = companyId
    ? await prisma.project.findMany({
        where:   { companyId },
        include: { customer: true, tasks: true },
        orderBy: { createdAt: "desc" },
      })
    : []

  const activos     = projects.filter(p => p.status === "IN_PROGRESS").length
  const pendientes  = projects.filter(p => p.status === "PENDING").length
  const finalizados = projects.filter(p => p.status === "COMPLETED").length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Proyectos</h1>
          <p className="text-sm text-text-secondary mt-0.5">{projects.length} proyectos</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary">
          <FolderPlus size={15} />
          Nuevo proyecto
        </Link>
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Activos",     value: activos,     color: "text-brand-600"   },
            { label: "Pendientes",  value: pendientes,  color: "text-amber-600"   },
            { label: "Finalizados", value: finalizados, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card py-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <FolderPlus size={20} className="text-brand-400" />
          </div>
          <p className="font-medium text-text-primary mb-1">Sin proyectos todavía</p>
          <p className="text-sm text-text-muted mb-4">Crea tu primer proyecto y organiza las tareas en un kanban</p>
          <Link href="/dashboard/projects/new" className="btn-primary inline-flex">
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const done  = p.tasks.filter(t => t.status === "DONE").length
            const total = p.tasks.length
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="card hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-600 transition-colors pr-2 leading-snug">
                    {p.name}
                  </h3>
                  <span className={`${STATUS_COLORS[p.status]} shrink-0`}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </div>

                {p.customer && (
                  <p className="text-xs text-text-secondary mb-2 flex items-center gap-1">
                    👤 {p.customer.name}
                  </p>
                )}

                {p.description && (
                  <p className="text-xs text-text-muted line-clamp-2 mb-3">{p.description}</p>
                )}

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>{done}/{total} tareas</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-text-muted border-t border-surface-border pt-3">
                  <span>{total} tarea{total !== 1 ? "s" : ""}</span>
                  {p.endDate && <span>Fin: {formatDate(p.endDate)}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
