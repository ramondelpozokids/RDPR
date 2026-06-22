"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/Toaster"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Link2, Ban, Loader2 } from "lucide-react"

type Tx = {
  id: string
  date: string
  description: string
  amount: number
  status: string
  bankAccount: { name: string }
}

type Suggestion = {
  type: "invoice" | "expense"
  targetId: string
  label: string
  amount: number
}

export function ReconciliationList({ transactions }: { transactions: Tx[] }) {
  const router = useRouter()
  const unmatched = transactions.filter((t) => t.status === "UNMATCHED")

  if (unmatched.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay movimientos pendientes de conciliar. Importa un CSV desde Banca.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border">
      {unmatched.map((tx) => (
        <ReconciliationRow key={tx.id} tx={tx} onDone={() => router.refresh()} />
      ))}
    </div>
  )
}

function ReconciliationRow({ tx, onDone }: { tx: Tx; onDone: () => void }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    fetch(`/api/banking/transactions/${tx.id}/suggestions`)
      .then((r) => r.json())
      .then((j) => setSuggestions(j.data ?? []))
      .finally(() => setLoading(false))
  }, [tx.id])

  async function match(opts: { invoiceId?: string; expenseId?: string; ignore?: boolean }) {
    setActing(true)
    const res = await fetch(`/api/banking/transactions/${tx.id}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    })
    setActing(false)
    if (res.ok) {
      toast.success(opts.ignore ? "Movimiento ignorado" : "Conciliado correctamente")
      onDone()
    } else {
      const j = await res.json()
      toast.error(j.error ?? "Error al conciliar")
    }
  }

  const isIn = tx.amount > 0

  return (
    <div className="py-4 px-1 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatDate(new Date(tx.date))}</span>
          <Badge variant="muted">{tx.bankAccount.name}</Badge>
          <Badge variant={isIn ? "success" : "warning"}>{isIn ? "Entrada" : "Salida"}</Badge>
        </div>
        <p className="font-medium text-sm mt-1 truncate">{tx.description}</p>
      </div>
      <div className={`text-right font-semibold shrink-0 ${isIn ? "text-emerald-600" : "text-red-600"}`}>
        {formatCurrency(tx.amount)}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {loading ? (
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        ) : (
          suggestions.map((s) => (
            <Button
              key={s.targetId}
              size="sm"
              variant="secondary"
              disabled={acting}
              onClick={() =>
                match(s.type === "invoice" ? { invoiceId: s.targetId } : { expenseId: s.targetId })
              }
            >
              <Link2 size={12} />
              {s.label.slice(0, 28)}
              {s.label.length > 28 ? "…" : ""}
            </Button>
          ))
        )}
        <Button size="sm" variant="ghost" disabled={acting} onClick={() => match({ ignore: true })}>
          <Ban size={12} /> Ignorar
        </Button>
      </div>
    </div>
  )
}
