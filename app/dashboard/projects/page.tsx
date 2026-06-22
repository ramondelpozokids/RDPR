// app/dashboard/projects/page.tsx
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, PROJECT_STATUS_LABELS } from "@/lib/utils"
import { FolderPlus, FolderKanban, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ProjectKanbanBoard } from "@/components/projects/ProjectKanbanBoard"
import { KanbanListPageClient } from "@/components/ui/view-toggle"
import { MetricCard } from "@/components/ui/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const STATUS_BADGE: Record<string, "muted" | "info" | "success" | "destructive"> = {
  PENDING: "muted",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "destructive",
}

export default async function ProjectsPage() {
  const companyId = await getActiveCompanyId()

  const projects = companyId
    ? await prisma.project.findMany({
        where: { companyId },
        include: { customer: true, tasks: { select: { status: true } } },
        orderBy: { createdAt: "desc" },
      })
    : []

  const activos = projects.filter((p) => p.status === "IN_PROGRESS").length
  const pendientes = projects.filter((p) => p.status === "PENDING").length
  const finalizados = projects.filter((p) => p.status === "COMPLETED").length

  const kanbanData = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    endDate: p.endDate?.toISOString() ?? null,
    customerName: p.customer?.name ?? null,
    taskTotal: p.tasks.length,
    taskDone: p.tasks.filter((t) => t.status === "DONE").length,
  }))

  const kanbanView = <ProjectKanbanBoard projects={kanbanData} />

  const listView =
    projects.length === 0 ? (
      <Card className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
          <FolderPlus size={20} className="text-primary" />
        </div>
        <p className="font-medium text-foreground mb-1">Sin proyectos todavía</p>
        <p className="text-sm text-muted-foreground mb-4">Crea tu primer proyecto y organiza las tareas en un kanban</p>
        <Button asChild>
          <Link href="/dashboard/projects/new">Crear primer proyecto</Link>
        </Button>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const done = p.tasks.filter((t) => t.status === "DONE").length
          const total = p.tasks.length
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="p-5 hover:shadow-md transition-all h-full">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{p.name}</h3>
                  <Badge variant={STATUS_BADGE[p.status]}>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                </div>
                {p.customer && (
                  <p className="text-xs text-muted-foreground mb-2">{p.customer.name}</p>
                )}
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                )}
                {total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {done}/{total} tareas
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>
                    {total} tarea{total !== 1 ? "s" : ""}
                  </span>
                  {p.endDate && <span>Fin: {formatDate(p.endDate)}</span>}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} proyectos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <FolderPlus size={15} />
            Nuevo proyecto
          </Link>
        </Button>
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MetricCard label="Activos" value={activos} icon={FolderKanban} iconColor="text-primary" iconBg="bg-accent" />
          <MetricCard label="Pendientes" value={pendientes} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <MetricCard label="Finalizados" value={finalizados} icon={CheckCircle2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        </div>
      )}

      {projects.length === 0 ? (
        listView
      ) : (
        <KanbanListPageClient kanban={kanbanView} list={listView} kanbanLabel="Kanban" />
      )}
    </div>
  )
}
