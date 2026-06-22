"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Input } from "@/components/ui"
import { formatDate } from "@/lib/utils"
import { Loader2, Send } from "lucide-react"

type Message = {
  id: string
  body: string
  authorRole: "CLIENT" | "ADVISOR"
  createdAt: string
  author?: { name: string | null }
}

export function CustomerMessagesPanel({ customerId }: { customerId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch(`/api/crm/customers/${customerId}/messages`)
    const json = await res.json()
    if (json.data) setMessages(json.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [customerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    const res = await fetch(`/api/crm/customers/${customerId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    })
    if (res.ok) {
      setBody("")
      await load()
    }
    setSending(false)
  }

  if (loading) return <p className="text-sm text-text-muted">Cargando conversación…</p>

  return (
    <div className="flex flex-col h-[min(70vh,520px)] card p-0 overflow-hidden max-w-2xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Sin mensajes con el cliente en el portal.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.authorRole === "ADVISOR"
                  ? "ml-auto bg-brand-500 text-white"
                  : "mr-auto bg-surface-muted text-text-primary"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.authorRole === "ADVISOR" ? "text-white/70" : "text-text-muted"}`}>
                {m.authorRole === "CLIENT" ? "Cliente" : m.author?.name ?? "Asesoría"} · {formatDate(m.createdAt)}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-surface-border p-3 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Responder al cliente…"
          className="flex-1"
        />
        <Button type="submit" disabled={sending || !body.trim()}>
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </Button>
      </form>
    </div>
  )
}
