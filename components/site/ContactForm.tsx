"use client"

import { useState } from "react"
import { Send, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al enviar")
      setDone(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600 mb-3" size={32} />
        <p className="font-semibold text-emerald-900">Consulta enviada correctamente</p>
        <p className="text-sm text-emerald-800 mt-2">Te responderemos lo antes posible.</p>
        <button type="button" className="text-sm text-brand-600 font-medium mt-4 underline" onClick={() => setDone(false)}>
          Enviar otra consulta
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1.5">Nombre *</label>
          <input id="name" name="name" required className="input" placeholder="Su nombre" />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1.5">Email *</label>
          <input id="email" name="email" type="email" required className="input" placeholder="email@empresa.com" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium block mb-1.5">Teléfono</label>
        <input id="phone" name="phone" className="input" placeholder="+34 600 000 000" />
      </div>
      <div>
        <label htmlFor="subject" className="text-sm font-medium block mb-1.5">Asunto *</label>
        <input id="subject" name="subject" required className="input" placeholder="Asesoría fiscal, demo RDPR OS…" />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium block mb-1.5">Mensaje *</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="input min-h-[120px] resize-y"
          placeholder="Cuéntenos qué necesita su empresa…"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Enviar consulta
      </Button>
    </form>
  )
}
