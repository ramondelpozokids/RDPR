"use client"

import { useEffect, useState } from "react"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { Button, Input } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/Toaster"
import { formatDate, formatCurrency } from "@/lib/utils"
import { V1_TAX_MODEL_IDS } from "@/lib/tax/models-registry"
import { getTaxModel } from "@/lib/tax/models-registry"
import { Landmark, Loader2, ShieldCheck, FileText } from "lucide-react"

type Filing = {
  id: string
  modelId: string
  periodYear: number
  periodQuarter: number | null
  status: string
  aeatCsv: string | null
  mode: string
  submittedAt: string | null
  createdAt: string
}

type RegistryEntry = {
  id: string
  hash: string
  aeatCsv: string | null
  status: string
  submittedAt: string | null
  invoice: { number: string; total: number }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  SUBMITTED: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
}

export default function AeatPage() {
  const [filings, setFilings] = useState<Filing[]>([])
  const [registry, setRegistry] = useState<RegistryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [config, setConfig] = useState({ mode: "test", certificateRef: "" })
  const [form, setForm] = useState({
    modelId: "303",
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
  })

  async function load() {
    const [f, c] = await Promise.all([
      fetch("/api/aeat/tax-filings").then((r) => r.json()),
      fetch("/api/aeat/config").then((r) => r.json()),
    ])
    if (f.data) {
      setFilings(f.data.filings ?? [])
      setRegistry(f.data.registry ?? [])
    }
    if (c.data) {
      setConfig({
        mode: c.data.mode ?? "test",
        certificateRef: c.data.certificateRef ?? "",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function saveConfig() {
    const res = await fetch("/api/aeat/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
    if (res.ok) toast.success("Configuración AEAT guardada")
    else toast.error("Error al guardar")
  }

  async function submitFiling(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch("/api/aeat/tax-filings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Modelo ${form.modelId} presentado (modo ${config.mode})`, json.data?.aeatCsv ?? undefined)
      await load()
    } else {
      toast.error(json.error ?? "Error al presentar")
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-8">
        <Loader2 size={16} className="animate-spin" /> Cargando AEAT…
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Presentación AEAT</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verifactu y modelos fiscales · modo {config.mode === "prod" ? "producción" : "test/simulación"}
          </p>
        </div>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck size={16} /> Configuración certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              En modo test las presentaciones son simuladas. Para producción configure la referencia al certificado digital FNMT.
            </p>
            <div>
              <label className="text-xs font-medium">Modo</label>
              <select
                className="input w-full mt-1"
                value={config.mode}
                onChange={(e) => setConfig({ ...config, mode: e.target.value })}
              >
                <option value="test">Test / simulación</option>
                <option value="prod">Producción (requiere certificado)</option>
              </select>
            </div>
            <Input
              label="Referencia certificado"
              value={config.certificateRef}
              onChange={(e) => setConfig({ ...config, certificateRef: e.target.value })}
              placeholder="vault:aeat-cert-rdpr"
            />
            <Button type="button" onClick={saveConfig} variant="secondary" size="sm">
              Guardar configuración
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark size={16} /> Presentar modelo fiscal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitFiling} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Modelo</label>
                <select
                  className="input w-full mt-1"
                  value={form.modelId}
                  onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                >
                  {V1_TAX_MODEL_IDS.map((id) => {
                    const m = getTaxModel(id)
                    return (
                      <option key={id} value={id}>
                        {m?.name ?? id}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Año"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                />
                <Input
                  label="Trimestre"
                  type="number"
                  min={1}
                  max={4}
                  value={form.quarter}
                  onChange={(e) => setForm({ ...form, quarter: Number(e.target.value) })}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                Presentar en AEAT (simulación)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial modelos fiscales</CardTitle>
          </CardHeader>
          <CardContent>
            {filings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin presentaciones registradas.</p>
            ) : (
              <ul className="space-y-2">
                {filings.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border text-sm">
                    <div>
                      <span className="font-medium">Modelo {f.modelId}</span>
                      <span className="text-muted-foreground ml-2">
                        {f.periodYear}
                        {f.periodQuarter ? ` · T${f.periodQuarter}` : ""}
                      </span>
                      {f.aeatCsv && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">CSV: {f.aeatCsv}</p>
                      )}
                    </div>
                    <Badge variant={f.status === "ACCEPTED" ? "success" : f.status === "REJECTED" ? "destructive" : "muted"}>
                      {STATUS_LABELS[f.status] ?? f.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={16} /> Registro Verifactu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registry.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Registre facturas desde Facturas → Registrar en AEAT (Verifactu).
              </p>
            ) : (
              <ul className="space-y-2">
                {registry.map((r) => (
                  <li key={r.id} className="p-2 rounded-lg border text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{r.invoice.number}</span>
                      <Badge variant={r.status === "ACCEPTED" ? "success" : "destructive"}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(r.invoice.total)} · {r.submittedAt ? formatDate(r.submittedAt) : "—"}
                    </p>
                    {r.aeatCsv && <p className="text-[10px] font-mono text-muted-foreground">CSV: {r.aeatCsv}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
