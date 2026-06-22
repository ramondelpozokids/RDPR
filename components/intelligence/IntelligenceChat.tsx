"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Send, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IntelligenceQueryId, IntelligenceResult } from "@/lib/intelligence/queries"

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; result?: IntelligenceResult; error?: string }

const SUGGESTIONS: Array<{ id: IntelligenceQueryId; label: string }> = [
  { id: "billed_month", label: "Facturación del mes" },
  { id: "paid_month", label: "Cobros del mes" },
  { id: "overdue_invoices", label: "Facturas vencidas" },
  { id: "top_customers", label: "Top clientes" },
  { id: "active_projects", label: "Proyectos activos" },
  { id: "expenses_month", label: "Gastos del mes" },
]

function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

export function IntelligenceChat({ companyName }: { companyName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hola. Soy **RDPR Intelligence** — analizo los datos reales de **${companyName}**. Elige una pregunta sugerida o escribe en lenguaje natural (v0).`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function ask(queryId?: IntelligenceQueryId, message?: string) {
    const userText = message ?? SUGGESTIONS.find((s) => s.id === queryId)?.label ?? ""
    if (!userText.trim()) return

    setMessages((prev) => [...prev, { role: "user", content: userText }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/intelligence/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId, message: message ?? undefined }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.error ?? "Error al procesar la consulta.", error: json.error },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.data.answer, result: json.data },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Inténtalo de nuevo.", error: "network" },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    ask(undefined, input.trim())
  }

  return (
    <Card className="flex flex-col overflow-hidden h-[calc(100vh-12rem)] min-h-[520px]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-sm">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">RDPR Intelligence</p>
          <p className="text-[11px] text-muted-foreground truncate">{companyName} · Consultas en tiempo real</p>
        </div>
        <Badge variant="success">v0</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm bg-muted border border-border text-foreground"
              )}
            >
              {renderMarkdownLite(msg.content)}

              {msg.role === "assistant" && msg.result?.highlights && msg.result.highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60">
                  {msg.result.highlights.map((h) => (
                    <div key={h.label} className="rounded-lg bg-background/80 px-2.5 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{h.label}</p>
                      <p className="text-sm font-semibold text-foreground">{h.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {msg.role === "assistant" && msg.result?.links && msg.result.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.result.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      {link.label}
                      <ArrowRight size={11} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-muted-foreground text-sm pl-1">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </span>
            Analizando datos…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border p-4 space-y-3 bg-background">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={loading}
              onClick={() => ask(s.id, PREDEFINED_LABELS[s.id])}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-accent hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ej: "¿Cuánto he facturado este mes?"'
            disabled={loading}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon" className="shrink-0 rounded-xl">
            <Send size={16} />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center">
          v0 — respuestas basadas en tus datos · solo lectura · empresa activa
        </p>
      </div>
    </Card>
  )
}

const PREDEFINED_LABELS: Record<IntelligenceQueryId, string> = {
  billed_month: "¿Cuánto he facturado este mes?",
  paid_month: "¿Cuánto he cobrado este mes?",
  vat_quarter: "¿Cuánto IVA estimo este trimestre?",
  pending_invoices: "¿Qué facturas están pendientes?",
  overdue_invoices: "¿Qué facturas están vencidas?",
  top_customers: "¿Qué clientes generan más ingresos?",
  customers_summary: "¿Cuántos clientes tengo?",
  active_projects: "¿Cuántos proyectos activos hay?",
  expenses_month: "¿Cuánto he gastado este mes?",
}
