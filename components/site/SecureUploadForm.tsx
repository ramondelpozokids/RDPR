"use client"

import { useState } from "react"
import { Upload, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SecureUploadForm() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refId, setRefId] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch("/api/secure-upload", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al subir")
      setRefId(json.id)
      setDone(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <ShieldCheck className="mx-auto text-emerald-600 mb-3" size={36} />
        <p className="font-semibold text-emerald-900">Documento recibido y cifrado</p>
        <p className="text-sm text-emerald-800 mt-2">
          Referencia: <span className="font-mono">{refId}</span>
        </p>
        <button type="button" className="text-sm text-brand-600 font-medium mt-4 underline" onClick={() => { setDone(false); setRefId(null) }}>
          Enviar otro documento
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="su-name" className="text-sm font-medium block mb-1.5">Nombre *</label>
          <input id="su-name" name="name" required className="input" />
        </div>
        <div>
          <label htmlFor="su-email" className="text-sm font-medium block mb-1.5">Email *</label>
          <input id="su-email" name="email" type="email" required className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="file" className="text-sm font-medium block mb-1.5">Documento * (PDF, imágenes, Office — máx. 15 MB)</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
          className="input file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm"
        />
      </div>
      <p className="text-xs text-text-muted flex items-start gap-2">
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-brand-600" />
        El archivo se cifra con AES-256-GCM antes de almacenarse. Solo personal autorizado puede acceder.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        Enviar documento cifrado
      </Button>
    </form>
  )
}
