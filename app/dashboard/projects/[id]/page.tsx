"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import { ArrowLeft, Plus, Pencil, X, ChevronDown } from "lucide-react"
import { formatDate, PROJECT_STATUS_LABELS } from "@/lib/utils"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { TaskKanbanBoard, type KanbanTask } from "@/components/projects/TaskKanbanBoard"

interface Project {
  id: string
  name: string
  status: string
  description: string | null
  startDate: string | null
  endDate: string | null
  customer?: { id: string; name: string } | null
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "COMPLETED", label: "Finalizado" },
  { value: "CANCELLED", label: "Cancelado" },
]

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState("MEDIUM")
  const [newDue, setNewDue] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [pr, ta] = await Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/tasks`).then((r) => r.json()),
    ])
    if (pr.success) setProject(pr.data)
    if (ta.success) {
      setTasks(
        ta.data.map((t: KanbanTask) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
        }))
      )
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function addTask() {
    if (!newTitle.trim()) return
    setSaving(true)
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        priority: newPriority,
        dueDate: newDue || undefined,
      }),
    })
    if (res.ok) {
      setNewTitle("")
      setNewDue("")
      setAdding(false)
      await load()
    }
    setSaving(false)
  }

  async function updateProjectStatus(status: string) {
    setProject((prev) => (prev ? { ...prev, status } : prev))
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  }

  async function deleteProject() {
    if (!confirm(`¿Eliminar "${project?.name}"? Se eliminarán todas las tareas.`)) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    router.push("/dashboard/projects")
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  if (!project) return <p className="text-muted-foreground">Proyecto no encontrado.</p>

  const done = tasks.filter((t) => t.status === "DONE").length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/projects" className="text-muted-foreground hover:text-foreground mt-1 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="flex-1 min-w-0 truncate">{project.name}</h1>
            <div className="relative group">
              <button
                className={`${
                  project.status === "IN_PROGRESS"
                    ? "badge-blue"
                    : project.status === "COMPLETED"
                      ? "badge-green"
                      : project.status === "CANCELLED"
                        ? "badge-red"
                        : "badge-gray"
                } flex items-center gap-1 cursor-pointer`}
              >
                {PROJECT_STATUS_LABELS[project.status]}
                <ChevronDown size={11} />
              </button>
              <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-lg shadow-modal py-1 min-w-[160px] hidden group-hover:block">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => updateProjectStatus(o.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {project.customer && (
            <p className="text-sm text-muted-foreground mt-0.5">
              <Link href={`/dashboard/crm/${project.customer.id}`} className="hover:text-primary hover:underline">
                {project.customer.name}
              </Link>
            </p>
          )}
          {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setEditProject((e) => !e)}>
            <Pencil size={13} />
            Editar
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={14} />
            Tarea
          </Button>
        </div>
      </div>

      {editProject && (
        <Card className="mb-6 border-primary/20 bg-accent/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Editar proyecto</h3>
            <div className="flex gap-2">
              <button onClick={deleteProject} className="text-xs text-destructive hover:opacity-80 font-medium">
                Eliminar proyecto
              </button>
              <button onClick={() => setEditProject(false)} className="text-muted-foreground hover:text-foreground ml-2">
                <X size={16} />
              </button>
            </div>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const body = Object.fromEntries(fd.entries())
              const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              })
              if (res.ok) {
                setEditProject(false)
                await load()
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input name="name" label="Nombre" defaultValue={project.name} required />
            <Select name="status" label="Estado" options={STATUS_OPTIONS} defaultValue={project.status} />
            <Input name="startDate" label="Inicio" type="date" defaultValue={project.startDate?.slice(0, 10) ?? ""} />
            <Input name="endDate" label="Fin" type="date" defaultValue={project.endDate?.slice(0, 10) ?? ""} />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" size="sm">
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      )}

      {total > 0 && (
        <Card className="mb-6 py-4 px-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">Progreso del proyecto</span>
            <span className="font-semibold text-foreground">
              {done}/{total} tareas · {pct}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Card>
      )}

      {adding && (
        <Card className="mb-6 p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Nueva tarea</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Título *"
              placeholder='Ej: "Diseñar home"'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Select label="Prioridad" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} options={PRIORITY_OPTIONS} />
            <Input label="Fecha límite" type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} loading={saving} size="sm">
              Añadir tarea
            </Button>
            <Button variant="secondary" onClick={() => setAdding(false)} size="sm">
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <TaskKanbanBoard projectId={id} tasks={tasks} onAddTask={() => setAdding(true)} />
    </div>
  )
}
