"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button, Input } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/Toaster"
import { formatDate } from "@/lib/utils"
import { PenLine, Loader2, ExternalLink, CheckCircle2 } from "lucide-react"

type SignatureReq = {
  id: string
  title: string
  status: string
  signerEmail: string
  signerName: string | null
  externalId: string | null
  signedAt: string | null
  createdAt: string
  document: { id: string; name: string; fileUrl: string }
  customer?: { id: string; name: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente firma",
  SIGNED: "Firmado",
  REJECTED: "Rechazado",
  EXPIRED: "Caducado",
  CANCELLED: "Cancelado",
}

export default function SignaturesPage() {
  const [requests, setRequests] = useState<SignatureReq[]>([])
  const [documents, setDocuments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    documentId: "",
    title: "",
    signerEmail: "",
    signerName: "",
  })

  async function load() {
    const [s, d] = await Promise.all([
      fetch("/api/signatures").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ])
    if (s.data) setRequests(s.data)
    if (d.data) setDocuments(d.data.map((doc: { id: string; name: string }) => ({ id: doc.id, name: doc.name })))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function createRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!form.documentId || !form.title.trim() || !form.signerEmail.trim()) return
    setSaving(true)
    const res = await fetch("/api/signatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success("Solicitud de firma creada", json.signingUrl ? "Enlace generado (modo test)" : undefined)
      setForm({ documentId: "", title: "", signerEmail: "", signerName: "" })
      await load()
    } else {
      toast.error(json.error ?? "Error al crear solicitud")
    }
    setSaving(false)
  }

  async function markSigned(id: string) {
    const res = await fetch(`/api/signatures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SIGNED" }),
    })
    if (res.ok) {
      toast.success("Marcado como firmado")
      await load()
    } else {
      toast.error("Error al actualizar")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-8">
        <Loader2 size={16} className="animate-spin" /> Cargando firmas…
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <PenLine size={22} /> RDPR Signature
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Firma electrónica de contratos, actas y documentos · integración proveedor en roadmap
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={createRequest} className="card p-5 space-y-3 lg:col-span-1">
          <h2 className="font-semibold text-sm">Nueva solicitud</h2>
          <div>
            <label className="text-xs font-medium">Documento</label>
            <select
              className="input w-full mt-1"
              value={form.documentId}
              onChange={(e) => setForm({ ...form, documentId: e.target.value })}
              required
            >
              <option value="">Seleccionar…</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input
            label="Email firmante"
            type="email"
            value={form.signerEmail}
            onChange={(e) => setForm({ ...form, signerEmail: e.target.value })}
            required
          />
          <Input
            label="Nombre firmante"
            value={form.signerName}
            onChange={(e) => setForm({ ...form, signerName: e.target.value })}
          />
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Solicitar firma"}
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Modo test: genera ID externo simulado. Webhook en <code>/api/signatures/webhook</code>.
          </p>
        </form>

        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-sm mb-4">Solicitudes ({requests.length})</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin solicitudes de firma.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.document.name} · {r.signerEmail}
                      {r.customer ? ` · ${r.customer.name}` : ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={r.status === "SIGNED" ? "success" : r.status === "PENDING" ? "warning" : "muted"}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                    {r.status === "PENDING" && (
                      <Button type="button" size="sm" variant="secondary" onClick={() => markSigned(r.id)}>
                        <CheckCircle2 size={12} /> Simular firma
                      </Button>
                    )}
                    <a href={r.document.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ver documento">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Vincula firmas a expedientes jurídicos desde{" "}
            <Link href="/dashboard/legal" className="text-primary hover:underline">
              Legal
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
