"use client"

import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/Toaster"
import { CheckCircle, Trash2 } from "lucide-react"

export function ExpenseActions({ expenseId, status }: { expenseId: string; status: string }) {
  const router = useRouter()

  async function markPaid() {
    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    })
    if (res.ok) {
      toast.success("Gasto marcado como pagado")
      router.refresh()
    } else {
      toast.error("Error al actualizar")
    }
  }

  async function cancel() {
    if (!confirm("¿Anular este gasto?")) return
    const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Gasto anulado")
      router.refresh()
    } else {
      toast.error("Error al anular")
    }
  }

  if (status === "CANCELLED") return null

  return (
    <div className="flex items-center gap-2">
      {status === "PENDING" && (
        <button type="button" onClick={markPaid} className="text-xs text-emerald-600 hover:underline font-medium flex items-center gap-1">
          <CheckCircle size={12} /> Pagar
        </button>
      )}
      <button type="button" onClick={cancel} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
        <Trash2 size={12} />
      </button>
    </div>
  )
}
