"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { formatDate } from "@/lib/utils"
import {
  CUSTOMER_TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/crm/labels"
import { Plus, Trash2 } from "lucide-react"

type Task = {
  id: string
  title: string
  description: string | null
  type: string
  priority: string
  status: string
  dueDate: string | null
}

const TYPE_OPTIONS = Object.entries(CUSTOMER_TASK_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label }))

const STATUS_COLORS: Record<string, string> = {
  TODO: "badge-yellow",
  IN_PROGRESS: "badge-blue",
  DONE: "badge-green",
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "badge-gray",
  MEDIUM: "badge-blue",
  HIGH: "badge-yellow",
  URGENT: "badge-red",
}

export function CustomerTasksPanel({
  customerId,
  initialTasks,
}: {
  customerId: string
  initialTasks: Task[]
}) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("GENERAL")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch(`/api/customers/${customerId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, priority, dueDate: dueDate || undefined }),
    })
    const json = await res.json()
    if (res.ok) {
      setTasks((prev) => [json.data, ...prev])
      setTitle("")
      setDueDate("")
      setShowForm(false)
      toast.success("Tarea creada")
    } else {
      toast.error("Error", json.error)
    }
    setLoading(false)
  }

  async function updateStatus(taskId: string, status: string) {
    const res = await fetch(`/api/customers/${customerId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const json = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === taskId ? json.data : t)))
      router.refresh()
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/customers/${customerId}/tasks/${taskId}`, { method: "DELETE" })
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast.success("Tarea eliminada")
    }
  }

  const pending = tasks.filter((t) => t.status !== "DONE")
  const done = tasks.filter((t) => t.status === "DONE")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>Tareas ({pending.length} pendientes)</h3>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-secondary text-sm">
          <Plus size={14} /> Nueva tarea
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTask} className="card space-y-3">
          <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="Tipo" options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value)} />
            <Select label="Prioridad" options={PRIORITY_OPTIONS} value={priority} onChange={(e) => setPriority(e.target.value)} />
            <Input label="Fecha límite" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Button type="submit" loading={loading}>Crear</Button>
        </form>
      )}

      {pending.length === 0 && done.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-sm text-text-muted">Sin tareas en este expediente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((t) => (
            <div key={t.id} className="card py-3 px-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="badge-gray text-[10px]">{CUSTOMER_TASK_TYPE_LABELS[t.type]}</span>
                  <span className={PRIORITY_COLORS[t.priority]}>{TASK_PRIORITY_LABELS[t.priority]}</span>
                  {t.dueDate && (
                    <span className="text-xs text-text-muted">Vence: {formatDate(t.dueDate)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="input text-xs py-1"
                  value={t.status}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button type="button" onClick={() => deleteTask(t.id)} className="btn-icon text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {done.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-text-muted cursor-pointer">Completadas ({done.length})</summary>
              <div className="space-y-2 mt-2 opacity-70">
                {done.map((t) => (
                  <div key={t.id} className="card py-2 px-4 flex justify-between items-center">
                    <span className="text-sm line-through">{t.title}</span>
                    <span className={STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
