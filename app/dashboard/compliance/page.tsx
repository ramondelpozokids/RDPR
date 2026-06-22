"use client"

import { useEffect, useState } from "react"
import { Button, Input, Textarea } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/Toaster"
import { formatDate } from "@/lib/utils"
import { ShieldCheck, Loader2, FileText, UserCheck } from "lucide-react"

type ProcessingRecord = {
  id: string
  activity: string
  purpose: string
  legalBasis: string
  retention: string
  updatedAt: string
  customer?: { name: string } | null
}

type SubjectRequest = {
  id: string
  type: string
  status: string
  requesterName: string
  requesterEmail: string
  createdAt: string
}

const REQUEST_TYPES: Record<string, string> = {
  ACCESS: "Acceso",
  ERASURE: "Supresión",
  PORTABILITY: "Portabilidad",
  RECTIFICATION: "Rectificación",
}

export default function CompliancePage() {
  const [records, setRecords] = useState<ProcessingRecord[]>([])
  const [requests, setRequests] = useState<SubjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ratForm, setRatForm] = useState({
    activity: "",
    purpose: "",
    legalBasis: "Ejecución de contrato",
    retention: "5 años tras fin relación contractual",
    dataCategories: "Datos identificativos, fiscales, laborales",
    securityMeasures: "Cifrado en tránsito, control de acceso por empresa",
  })
  const [dsForm, setDsForm] = useState({
    type: "ACCESS" as const,
    requesterName: "",
    requesterEmail: "",
    notes: "",
  })

  async function load() {
    const [r, d] = await Promise.all([
      fetch("/api/compliance/processing-records").then((res) => res.json()),
      fetch("/api/compliance/data-subject-requests").then((res) => res.json()),
    ])
    if (r.data) setRecords(r.data)
    if (d.data) setRequests(d.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function addRat(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/compliance/processing-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...ratForm,
        dataCategories: ratForm.dataCategories.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    })
    if (res.ok) {
      toast.success("Actividad de tratamiento registrada")
      setRatForm({ ...ratForm, activity: "", purpose: "" })
      await load()
    } else {
      toast.error("Error al guardar RAT")
    }
    setSaving(false)
  }

  async function addDsRequest(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/compliance/data-subject-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dsForm),
    })
    if (res.ok) {
      toast.success("Solicitud ARSOP registrada")
      setDsForm({ ...dsForm, requesterName: "", requesterEmail: "", notes: "" })
      await load()
    } else {
      toast.error("Error al registrar solicitud")
    }
    setSaving(false)
  }

  async function closeRequest(id: string) {
    const res = await fetch("/api/compliance/data-subject-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CLOSED" }),
    })
    if (res.ok) {
      toast.success("Solicitud cerrada")
      await load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-8">
        <Loader2 size={16} className="animate-spin" /> Cargando compliance…
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <ShieldCheck size={22} /> RDPR Compliance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro de actividades de tratamiento (RGPD) y solicitudes de derechos ARSOP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <form onSubmit={addRat} className="card p-5 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <FileText size={16} /> Nueva actividad de tratamiento (RAT)
          </h2>
          <Input label="Actividad" value={ratForm.activity} onChange={(e) => setRatForm({ ...ratForm, activity: e.target.value })} required placeholder="Gestión fiscal del cliente" />
          <Input label="Finalidad" value={ratForm.purpose} onChange={(e) => setRatForm({ ...ratForm, purpose: e.target.value })} required placeholder="Cumplimiento obligaciones fiscales" />
          <Input label="Base legal" value={ratForm.legalBasis} onChange={(e) => setRatForm({ ...ratForm, legalBasis: e.target.value })} />
          <Input label="Categorías de datos (coma)" value={ratForm.dataCategories} onChange={(e) => setRatForm({ ...ratForm, dataCategories: e.target.value })} />
          <Input label="Plazo conservación" value={ratForm.retention} onChange={(e) => setRatForm({ ...ratForm, retention: e.target.value })} />
          <Textarea label="Medidas de seguridad" value={ratForm.securityMeasures} onChange={(e) => setRatForm({ ...ratForm, securityMeasures: e.target.value })} rows={2} />
          <Button type="submit" disabled={saving}>Registrar actividad</Button>
        </form>

        <form onSubmit={addDsRequest} className="card p-5 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <UserCheck size={16} /> Solicitud de derechos (ARSOP)
          </h2>
          <div>
            <label className="text-xs font-medium">Tipo</label>
            <select className="input w-full mt-1" value={dsForm.type} onChange={(e) => setDsForm({ ...dsForm, type: e.target.value as typeof dsForm.type })}>
              {Object.entries(REQUEST_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <Input label="Nombre solicitante" value={dsForm.requesterName} onChange={(e) => setDsForm({ ...dsForm, requesterName: e.target.value })} required />
          <Input label="Email" type="email" value={dsForm.requesterEmail} onChange={(e) => setDsForm({ ...dsForm, requesterEmail: e.target.value })} required />
          <Textarea label="Notas" value={dsForm.notes} onChange={(e) => setDsForm({ ...dsForm, notes: e.target.value })} rows={2} />
          <Button type="submit" disabled={saving}>Registrar solicitud</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Registro de tratamientos ({records.length})</h2>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividades registradas.</p>
          ) : (
            <ul className="space-y-2">
              {records.map((r) => (
                <li key={r.id} className="p-3 rounded-lg border text-sm">
                  <p className="font-medium">{r.activity}</p>
                  <p className="text-xs text-muted-foreground">{r.purpose}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Base: {r.legalBasis} · Conservación: {r.retention}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-3">Solicitudes ARSOP ({requests.length})</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin solicitudes pendientes.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="p-3 rounded-lg border text-sm flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{REQUEST_TYPES[r.type] ?? r.type}</p>
                    <p className="text-xs text-muted-foreground">{r.requesterName} · {r.requesterEmail}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={r.status === "CLOSED" ? "success" : "warning"}>{r.status}</Badge>
                    {r.status !== "CLOSED" && (
                      <Button type="button" size="sm" variant="secondary" onClick={() => closeRequest(r.id)}>
                        Cerrar
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
