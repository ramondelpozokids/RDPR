"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react"
import { formatDate, TASK_PRIORITY_LABELS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type KanbanTask = {
  id: string
  title: string
  priority: keyof typeof TASK_PRIORITY_LABELS
  status: "TODO" | "IN_PROGRESS" | "DONE"
  dueDate: string | null
}

const COLUMNS = [
  { key: "TODO" as const, label: "Por hacer", color: "border-t-muted-foreground/50", icon: Circle },
  { key: "IN_PROGRESS" as const, label: "En proceso", color: "border-t-primary", icon: Clock },
  { key: "DONE" as const, label: "Hecho", color: "border-t-emerald-500", icon: CheckCircle2 },
]

const PRIORITY_VARIANT: Record<string, "muted" | "info" | "warning" | "destructive"> = {
  LOW: "muted",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "destructive",
}

function isTaskOverdue(dueDate: string | null, status: KanbanTask["status"]) {
  if (!dueDate || status === "DONE") return false
  const d = new Date(dueDate)
  d.setHours(23, 59, 59, 999)
  return d < new Date()
}

export function TaskKanbanBoard({
  projectId,
  tasks: initial,
  onAddTask,
}: {
  projectId: string
  tasks: KanbanTask[]
  onAddTask?: () => void
}) {
  const [tasks, setTasks] = useState(initial)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    setTasks(initial)
  }, [initial])

  async function moveTask(taskId: string, status: KanbanTask["status"]) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === status) return

    setUpdatingId(taskId)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Error al actualizar")
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)))
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm("¿Eliminar esta tarea?")) return
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key)
        const Icon = col.icon
        return (
          <Card
            key={col.key}
            className={cn("border-t-4 overflow-hidden", col.color)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData("text/task-id")
              if (id) moveTask(id, col.key)
              setDraggingId(null)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Icon size={14} />
                  {col.label}
                </CardTitle>
                <Badge variant="muted">{colTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[100px] p-4 pt-0">
              {colTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                  Arrastra tareas aquí
                </p>
              ) : (
                colTasks.map((task) => {
                  const overdue = isTaskOverdue(task.dueDate, task.status)
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/task-id", task.id)
                        setDraggingId(task.id)
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        "rounded-lg border bg-card p-3 shadow-sm group cursor-grab active:cursor-grabbing transition-opacity",
                        draggingId === task.id && "opacity-50",
                        updatingId === task.id && "opacity-60 pointer-events-none",
                        overdue && "border-red-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-sm font-medium text-foreground leading-snug flex-1">{task.title}</p>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                        {task.dueDate && (
                          <span className={cn("text-[10px]", overdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
                            {overdue ? "Vencida · " : ""}
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              {onAddTask && (
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground" onClick={onAddTask}>
                  <Plus size={13} />
                  Añadir tarea
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
