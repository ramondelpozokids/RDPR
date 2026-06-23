"use client"

import { useEffect, useState } from "react"
import { Check, Zap, AlertTriangle } from "lucide-react"

type UsageData = {
  planId: string
  planName: string
  clients: number
  users: number
  ocrThisMonth: number
  signaturesThisMonth: number
  visionEnabled: boolean
  limits: {
    maxClients: number
    maxUsers: number
    maxOcrPerMonth: number
    maxSignaturesPerMonth: number
    openBanking: boolean
    intelligence: boolean
  }
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const warn = pct >= 85
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={warn ? "text-amber-600 font-medium" : "text-text-primary"}>
          {used} / {max >= 99999 ? "∞" : max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${warn ? "bg-amber-500" : "bg-brand-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PlanUsagePanel() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/billing/usage")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setUsage(j.data)
        else setError(j.error ?? "Error al cargar plan")
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="card text-sm text-text-muted">Cargando plan…</div>
  }

  if (error || !usage) {
    return (
      <div className="card flex items-center gap-2 text-sm text-amber-700">
        <AlertTriangle size={16} />
        {error ?? "No se pudo cargar el plan"}
      </div>
    )
  }

  const statusLabel =
    usage.planId === "trial" ? "Prueba" : usage.planId === "enterprise" ? "Enterprise" : "Activo"

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-text-primary">Plan {usage.planName}</p>
            <p className="text-sm text-text-secondary mt-1">
              Uso del mes actual · gestoría (tenant Firm)
            </p>
          </div>
          <span className="badge-green text-xs px-3 py-1">{statusLabel}</span>
        </div>

        <div className="space-y-4">
          <UsageBar label="Clientes" used={usage.clients} max={usage.limits.maxClients} />
          <UsageBar label="Usuarios" used={usage.users} max={usage.limits.maxUsers} />
          <UsageBar label="OCR este mes" used={usage.ocrThisMonth} max={usage.limits.maxOcrPerMonth} />
          <UsageBar
            label="Firmas este mes"
            used={usage.signaturesThisMonth}
            max={usage.limits.maxSignaturesPerMonth}
          />
        </div>
      </div>

      <div className="card">
        <p className="section-title mb-3">Funciones incluidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { ok: true, label: "Expediente 360 + CRM" },
            { ok: true, label: "Portal cliente + onboarding" },
            { ok: usage.limits.intelligence, label: "RDPR Intelligence (IA)" },
            { ok: usage.limits.openBanking, label: "Open Banking cliente" },
            { ok: usage.visionEnabled, label: "OCR Google Vision" },
            { ok: usage.limits.maxOcrPerMonth > 100, label: "OCR volumen alto" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-sm text-text-secondary">
              <Check size={13} className={f.ok ? "text-emerald-500 shrink-0" : "text-text-muted shrink-0 opacity-40"} />
              <span className={f.ok ? "" : "opacity-60"}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-brand-200 bg-gradient-to-br from-brand-50 via-white to-violet-50 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <Zap size={40} className="text-brand-200 opacity-50" />
        </div>
        <p className="font-bold text-brand-900 text-lg">¿Necesitas más capacidad?</p>
        <p className="text-sm text-brand-700 mt-1 mb-4">
          Sube a Professional (100 clientes, OCR 500/mes, Open Banking) o Business para equipos
          grandes. Contacta con RDPR para activar Stripe Checkout.
        </p>
        <a href="mailto:hola@rdpr.es?subject=Upgrade%20plan%20RDPR%20OS" className="btn-primary inline-flex">
          Solicitar upgrade
        </a>
      </div>
    </div>
  )
}
