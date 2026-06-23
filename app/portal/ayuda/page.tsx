"use client"

import { useState } from "react"
import { Button, Input } from "@/components/ui"
import { MessageCircleQuestion } from "lucide-react"

export default function PortalAyudaPage() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  async function ask(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    const res = await fetch("/api/portal/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
    const json = await res.json()
    setAnswer(json.answer ?? "No pude responder.")
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <MessageCircleQuestion size={20} /> Ayuda
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Preguntas frecuentes sobre documentos, firmas, impuestos y banca
        </p>
      </div>

      <form onSubmit={ask} className="card space-y-4">
        <Input
          label="Su pregunta"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ej: ¿Cómo subo una factura?"
        />
        <Button type="submit" loading={loading} className="w-full justify-center">
          Preguntar
        </Button>
      </form>

      {answer && (
        <div className="card bg-brand-50/30 border-brand-100">
          <p className="text-sm leading-relaxed">{answer}</p>
        </div>
      )}

      <div className="text-xs text-text-muted">
        Para consultas específicas, use{" "}
        <a href="/portal/mensajes" className="text-brand-600 hover:underline">
          Mensajes
        </a>{" "}
        y su gestoría le responderá.
      </div>
    </div>
  )
}
