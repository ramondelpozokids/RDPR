// app/(dashboard)/projects/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter }  from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import {
  ArrowLeft, Plus, CheckCircle2, Circle, Clock,
  Trash2, Pencil, X, ChevronDown
} from "lucide-react"
import { formatDate, TASK_PRIORITY_LABELS, PROJECT_STATUS_LABELS } from "@/lib/utils"
import Link from "next/link"

interface Task {
  id:          string
  title:       string
  description: string | null
  priority:    string
  status:      string
  dueDate:     string | null
  assignee?:   { id: string; name: string | null } | null
}

interface Project {
  id:          string
  name:        string
  status:      string
  description: string | null
  startDate:   string | null
  endDate:     string | null
  customer?:   { id: string; name: string } | null
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW:    "badge-gray",
  MEDIUM: "badge-blue",
  HIGH:   "badge-yellow",
  URGENT: "badge-red",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  TODO:        <Circle       size={14} className="text-text-muted"  />,
  IN_PROGRESS: <Clock        size={14} className="text-brand-500"   />,
  DONE:        <CheckCircle2 size={14} className="text-emerald-500" />,
}

const COLS = [
  { key: "TODO",        label: "Por hacer",  bg: "bg-gray-50"     },
  { key: "IN_PROGRESS", label: "En proceso", bg: "bg-brand-50/40" },
  { key: "DONE",        label: "Hecho",      bg: "bg-emerald-50"  },
]

const STATUS_OPTIONS = [
  { value: "PENDING",     label: "Pendiente"  },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "COMPLETED",   label: "Finalizado" },
  { value: "CANCELLED",   label: "Cancelado"  },
]

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Baja"    },
  { value: "MEDIUM", label: "Media"   },
  { value: "HIGH",   label: "Alta"    },
  { value: "URGENT", label: "Urgente" },
]

export default function ProjectDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [project, setProject]   = useState<Project | null>(null)
  const [tasks,   setTasks]     = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding,  setAdding]    = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState("MEDIUM")
  const [newDue, setNewDue]     = useState("")
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    const [pr, ta] = await Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch(`/api/projects/${id}/tasks`).then(r => r.json()),
    ])
    if (pr.success) setProject(pr.data)
    if (ta.success) setTasks(ta.data)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function addTask() {
    if (!newTitle.trim()) return
    setSaving(true)
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        title:    newTitle.trim(),
        priority: newPriority,
        dueDate:  newDue || undefined,
      }),
    })
    if (res.ok) {
      setNewTitle(""); setNewDue(""); setAdding(false)
      await load()
    }
    setSaving(false)
  }

  async function updateTaskStatus(taskId: string, status: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    await fetch(`/api/projects/${id}/tasks/${taskId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    })
  }

  async function deleteTask(taskId: string) {
    if (!confirm("¿Eliminar esta tarea?")) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: "DELETE" })
  }

  async function updateProjectStatus(status: string) {
    setProject(prev => prev ? { ...prev, status } : prev)
    await fetch(`/api/projects/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    })
  }

  async function deleteProject() {
    if (!confirm(`¿Eliminar "${project?.name}"? Se eliminarán todas las tareas.`)) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    router.push("/dashboard/projects")
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )
  if (!project) return <p className="text-text-secondary">Proyecto no encontrado.</p>

  const done  = tasks.filter(t => t.status === "DONE").length
  const total = tasks.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/projects" className="text-text-muted hover:text-text-primary mt-1 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="flex-1 min-w-0 truncate">{project.name}</h1>
            {/* Status dropdown */}
            <div className="relative group">
              <button className={`${
                project.status === "IN_PROGRESS" ? "badge-blue"   :
                project.status === "COMPLETED"   ? "badge-green"  :
                project.status === "CANCELLED"   ? "badge-red"    : "badge-gray"
              } flex items-center gap-1 cursor-pointer`}>
                {PROJECT_STATUS_LABELS[project.status]}
                <ChevronDown size={11} />
              </button>
              <div className="absolute right-0 top-7 z-20 bg-white border border-surface-border rounded-lg shadow-modal py-1 min-w-[160px] hidden group-hover:block">
                {STATUS_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => updateProjectStatus(o.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-muted transition-colors"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {project.customer && (
            <p className="text-sm text-text-secondary mt-0.5">
              👤{" "}
              <Link href={`/dashboard/crm/${project.customer.id}`} className="hover:text-brand-600 hover:underline">
                {project.customer.name}
              </Link>
            </p>
          )}
          {project.description && (
            <p className="text-sm text-text-muted mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditProject(e => !e)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <Pencil size={13} />
            Editar
          </button>
          <Button onClick={() => setAdding(true)} size="sm">
            <Plus size={14} />
            Tarea
          </Button>
        </div>
      </div>

      {/* Edit project panel */}
      {editProject && (
        <div className="card mb-6 border-brand-200 bg-brand-50/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Editar proyecto</h3>
            <div className="flex gap-2">
              <button
                onClick={deleteProject}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Eliminar proyecto
              </button>
              <button onClick={() => setEditProject(false)} className="text-text-muted hover:text-text-primary ml-2">
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
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
              })
              if (res.ok) { setEditProject(false); await load() }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input name="name" label="Nombre" defaultValue={project.name} required />
            <Select name="status" label="Estado" options={STATUS_OPTIONS} defaultValue={project.status} />
            <Input name="startDate" label="Inicio" type="date" defaultValue={project.startDate?.slice(0,10) ?? ""} />
            <Input name="endDate"   label="Fin"    type="date" defaultValue={project.endDate?.slice(0,10)   ?? ""} />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" size="sm">Guardar cambios</Button>
            </div>
          </form>
        </div>
      )}

      {/* Progress */}
      {total > 0 && (
        <div className="card mb-6 py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary font-medium">Progreso del proyecto</span>
            <span className="font-semibold text-text-primary">{done}/{total} tareas · {pct}%</span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Add task inline */}
      {adding && (
        <div className="card mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Nueva tarea</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                label="Título *"
                placeholder='Ej: "Diseñar home"'
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTask()}
              />
            </div>
            <Select
              label="Prioridad"
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              options={PRIORITY_OPTIONS}
            />
            <Input
              label="Fecha límite"
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} loading={saving} size="sm">Añadir tarea</Button>
            <Button variant="secondary" onClick={() => setAdding(false)} size="sm">Cancelar</Button>
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.key)
          const colIdx   = COLS.findIndex(c => c.key === col.key)
          return (
            <div key={col.key} className={`${col.bg} rounded-xl p-4 border border-surface-border`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {STATUS_ICON[col.key]}
                  <span className="text-sm font-semibold text-text-primary">{col.label}</span>
                </div>
                <span className="text-xs text-text-muted bg-white border border-surface-border rounded-full px-2 py-0.5 font-medium">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[80px]">
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-surface-border rounded-lg p-4 text-center">
                    <p className="text-xs text-text-muted">Sin tareas</p>
                  </div>
                )}
                {colTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg border border-surface-border p-3 shadow-card group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <p className="text-sm font-medium text-text-primary leading-snug flex-1">{task.title}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`${PRIORITY_COLORS[task.priority]} text-xs`}>
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-text-muted">📅 {formatDate(task.dueDate)}</span>
                      )}
                    </div>

                    {/* Move buttons */}
                    <div className="flex gap-1.5 mt-2 pt-2 border-t border-surface-border">
                      {colIdx > 0 && (
                        <button
                          onClick={() => updateTaskStatus(task.id, COLS[colIdx - 1].key)}
                          className="text-xs text-text-muted hover:text-text-primary transition-colors"
                        >
                          ← Atrás
                        </button>
                      )}
                      {colIdx < COLS.length - 1 && (
                        <button
                          onClick={() => updateTaskStatus(task.id, COLS[colIdx + 1].key)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors ml-auto"
                        >
                          Avanzar →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick add in column */}
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  className="mt-3 w-full flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors py-1"
                >
                  <Plus size={13} />
                  Añadir tarea
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
