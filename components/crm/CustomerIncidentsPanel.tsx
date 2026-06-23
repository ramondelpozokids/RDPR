"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select, Textarea } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { formatDate } from "@/lib/utils"
import { INCIDENT_SEVERITY_LABELS, INCIDENT_STATUS_LABELS } from "@/lib/crm/labels"
import { Plus, Trash2 } from "lucide-react"

type Incident = {
  id: string
  title: string
  description: string | null
  severity: string
  status: string
  createdAt: string
  resolvedAt: string | null
}

const SEVERITY_OPTIONS = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "badge-gray",
  MEDIUM: "badge-yellow",
  HIGH: "badge-red",
  CRITICAL: "badge-red",
}

export function CustomerIncidentsPanel({
  customerId,
  initialIncidents,
}: {
  customerId: string
  initialIncidents: Incident[]
}) {
  const router = useRouter()
  const [incidents, setIncidents] = useState(initialIncidents)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("MEDIUM")

  async function createIncident(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch(`/api/customers/${customerId}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, severity }),
    })
    const json = await res.json()
    if (res.ok) {
      setIncidents((prev) => [json.data, ...prev])
      setTitle("")
      setDescription("")
      setShowForm(false)
      toast.success("Incidencia registrada")
      router.refresh()
    } else {
      toast.error("Error", json.error)
    }
    setLoading(false)
  }

  async function updateStatus(incidentId: string, status: string) {
    const res = await fetch(`/api/customers/${customerId}/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const json = await res.json()
      setIncidents((prev) => prev.map((i) => (i.id === incidentId ? json.data : i)))
      router.refresh()
    }
  }

  async function deleteIncident(incidentId: string) {
    const res = await fetch(`/api/customers/${customerId}/incidents/${incidentId}`, { method: "DELETE" })
    if (res.ok) {
      setIncidents((prev) => prev.filter((i) => i.id !== incidentId))
      toast.success("Incidencia eliminada")
    }
  }

  const open = incidents.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>Incidencias ({open.length} abiertas)</h3>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-secondary text-sm">
          <Plus size={14} /> Nueva incidencia
        </button>
      </div>

      {showForm && (
        <form onSubmit={createIncident} className="card space-y-3">
          <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Select label="Gravedad" options={SEVERITY_OPTIONS} value={severity} onChange={(e) => setSeverity(e.target.value)} />
          <Button type="submit" loading={loading}>Registrar</Button>
        </form>
      )}

      {incidents.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-sm text-text-muted">Sin incidencias registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.map((i) => (
            <div key={i.id} className="card py-3 px-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{i.title}</p>
                  {i.description && (
                    <p className="text-xs text-text-secondary mt-1">{i.description}</p>
                  )}
                  <p className="text-[10px] text-text-muted mt-1">{formatDate(i.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={SEVERITY_COLORS[i.severity]}>{INCIDENT_SEVERITY_LABELS[i.severity]}</span>
                  <select
                    className="input text-xs py-1"
                    value={i.status}
                    onChange={(e) => updateStatus(i.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => deleteIncident(i.id)} className="btn-icon text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
