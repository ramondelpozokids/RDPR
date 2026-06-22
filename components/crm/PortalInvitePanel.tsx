"use client"

import { useState } from "react"
import { Globe, Loader2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

type PortalInvitePanelProps = {
  customerId: string
  customerEmail: string | null
  initialAccess?: { user: { email: string } } | null
}

export function PortalInvitePanel({
  customerId,
  customerEmail,
  initialAccess,
}: PortalInvitePanelProps) {
  const [access, setAccess] = useState(initialAccess)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null)

  async function invite() {
    setLoading(true)
    setError(null)
    setCredentials(null)
    try {
      const res = await fetch(`/api/crm/customers/${customerId}/portal-invite`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al invitar")
      setAccess({ user: { email: json.email } })
      if (json.temporaryPassword) {
        setCredentials({ email: json.email, temporaryPassword: json.temporaryPassword })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  function copyCreds() {
    if (!credentials) return
    void navigator.clipboard.writeText(
      `Portal RDPR\nEmail: ${credentials.email}\nContraseña temporal: ${credentials.temporaryPassword}\nAcceso: /portal/documentos`
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-brand-600" />
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Portal cliente</h3>
      </div>
      {!customerEmail ? (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
          Añada un email al cliente para activar el portal.
        </p>
      ) : access ? (
        <div className="text-sm space-y-2">
          <p className="flex items-center gap-2 text-emerald-700">
            <Check size={14} /> Acceso activo: <span className="font-medium">{access.user.email}</span>
          </p>
          <p className="text-xs text-text-muted">El cliente entra en /portal/documentos con su email.</p>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          Invite a <span className="font-medium">{customerEmail}</span> al portal para ver documentos e impuestos.
        </p>
      )}
      {credentials && (
        <div className="text-xs bg-surface-muted rounded-lg p-3 space-y-1 font-mono">
          <p>Email: {credentials.email}</p>
          <p>Pass: {credentials.temporaryPassword}</p>
          <button type="button" onClick={copyCreds} className="text-brand-600 inline-flex items-center gap-1 mt-1">
            <Copy size={12} /> Copiar acceso
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {customerEmail && (
        <Button type="button" size="sm" onClick={invite} disabled={loading} className="w-full">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
          {access ? "Reenviar invitación" : "Activar portal"}
        </Button>
      )}
    </div>
  )
}
