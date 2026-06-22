"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate, PROJECT_STATUS_LABELS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export type KanbanProject = {
  id: string
  name: string
  description: string | null
  status: keyof typeof PROJECT_STATUS_LABELS
  endDate: string | null
  customerName: string | null
  taskTotal: number
  taskDone: number
}

const COLUMNS = [
  { key: "PENDING" as const, label: "Pendiente", color: "border-t-amber-500", badge: "warning" as const },
  { key: "IN_PROGRESS" as const, label: "En proceso", color: "border-t-primary", badge: "info" as const },
  { key: "COMPLETED" as const, label: "Finalizado", color: "border-t-emerald-500", badge: "success" as const },
  { key: "CANCELLED" as const, label: "Cancelado", color: "border-t-muted-foreground/40", badge: "muted" as const },
]

function isOverdue(endDate: string | null, status: KanbanProject["status"]) {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED") return false
  return new Date(endDate) < new Date()
}

export function ProjectKanbanBoard({ projects: initial }: { projects: KanbanProject[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState(initial)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function moveProject(projectId: string, status: KanbanProject["status"]) {
    const project = projects.find((p) => p.id === projectId)
    if (!project || project.status === status) return

    setUpdatingId(projectId)
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)))

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Error al actualizar")
      router.refresh()
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: project.status } : p))
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const column = projects.filter((p) => p.status === col.key)
        return (
          <Card
            key={col.key}
            className={cn("border-t-4 overflow-hidden", col.color)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData("text/project-id")
              if (id) moveProject(id, col.key)
              setDraggingId(null)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {col.label}
                </CardTitle>
                <Badge variant={col.badge}>{column.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[120px] p-4 pt-0">
              {column.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Arrastra proyectos aquí</p>
              ) : (
                column.map((project) => {
                  const pct =
                    project.taskTotal > 0 ? Math.round((project.taskDone / project.taskTotal) * 100) : 0
                  const overdue = isOverdue(project.endDate, project.status)
                  return (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/project-id", project.id)
                        setDraggingId(project.id)
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        "rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-opacity",
                        draggingId === project.id && "opacity-50",
                        updatingId === project.id && "opacity-60 pointer-events-none"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.name}
                        </Link>
                        {overdue && (
                          <span title="Fuera de plazo">
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      {project.customerName && (
                        <p className="text-[11px] text-muted-foreground truncate">{project.customerName}</p>
                      )}
                      {project.taskTotal > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>
                              {project.taskDone}/{project.taskTotal} tareas
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                      {project.endDate && (
                        <p
                          className={cn(
                            "text-[10px] mt-2",
                            overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                          )}
                        >
                          Fin: {formatDate(project.endDate)}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
