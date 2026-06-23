"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { PenLine, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

type Signature = {
  id: string
  title: string
  status: string
  externalId: string | null
  createdAt: string
  signedAt: string | null
  document: { name: string }
  authorizationGrant?: { scopes: string[]; status: string } | null
}

export default function PortalFirmasPage() {
  const searchParams = useSearchParams()
  const signId = searchParams.get("sign")
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)

  function load() {
    fetch("/api/portal/signatures")
      .then((r) => r.json())
      .then((json) => setSignatures(json.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function simulateSign(externalId: string) {
    setSigning(true)
    const res = await fetch("/api/portal/signatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalId }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success("Documento firmado")
      load()
    } else {
      toast.error("Error", json.error)
    }
    setSigning(false)
  }

  const pending = signatures.filter((s) => s.status === "PENDING")
  const highlight = signId ? pending.find((s) => s.externalId === signId) : pending[0]

  if (loading) return <p className="text-sm text-text-muted">Cargando...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <PenLine size={20} /> Firmas pendientes
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Autorizaciones y contratos que requieren su firma
        </p>
      </div>

      {highlight && (
        <div className="card border-brand-200 bg-brand-50/30 space-y-3">
          <h3>{highlight.title}</h3>
          <p className="text-xs text-text-muted">Documento: {highlight.document.name}</p>
          {highlight.authorizationGrant && (
            <p className="text-xs text-text-secondary">
              Permisos: {highlight.authorizationGrant.scopes.join(", ")}
            </p>
          )}
          <Button
            onClick={() => highlight.externalId && simulateSign(highlight.externalId)}
            loading={signing}
            className="w-full justify-center"
          >
            Firmar autorización
          </Button>
          <p className="text-[10px] text-text-muted text-center">
            En producción con Signaturit recibirá un enlace de firma legal certificada.
          </p>
        </div>
      )}

      {pending.length === 0 && (
        <div className="card text-center py-8">
          <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
          <p className="text-sm text-text-muted">No tiene firmas pendientes</p>
        </div>
      )}

      {signatures.filter((s) => s.status === "SIGNED").length > 0 && (
        <div className="card space-y-2">
          <h3 className="text-sm font-semibold">Firmados</h3>
          {signatures
            .filter((s) => s.status === "SIGNED")
            .map((s) => (
              <div key={s.id} className="flex justify-between text-sm py-2 border-b border-surface-border last:border-0">
                <span>{s.title}</span>
                <span className="text-xs text-text-muted">{s.signedAt ? formatDate(s.signedAt) : ""}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
