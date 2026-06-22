"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate, PIPELINE_LABELS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type PipelineCustomer = {
  id: string
  name: string
  email: string | null
  pipelineStage: keyof typeof PIPELINE_LABELS
  createdAt: string
  _count: { projects: number; invoices: number }
}

const STAGES = [
  { key: "NEW_CONTACT" as const, label: "Nuevo contacto", color: "border-t-brand-500", badge: "info" as const },
  { key: "QUOTE_SENT" as const, label: "Presupuesto", color: "border-t-amber-500", badge: "warning" as const },
  { key: "CLIENT_WON" as const, label: "Ganado", color: "border-t-emerald-500", badge: "success" as const },
  { key: "CLIENT_LOST" as const, label: "Perdido", color: "border-t-muted-foreground/40", badge: "muted" as const },
]

export function PipelineBoard({ customers: initial }: { customers: PipelineCustomer[] }) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initial)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function moveCustomer(customerId: string, stage: PipelineCustomer["pipelineStage"]) {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer || customer.pipelineStage === stage) return

    setUpdatingId(customerId)
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, pipelineStage: stage } : c)))

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: stage }),
      })
      if (!res.ok) throw new Error("Error al actualizar")
      router.refresh()
    } catch {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, pipelineStage: customer.pipelineStage } : c))
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const column = customers.filter((c) => c.pipelineStage === stage.key)
        return (
          <Card
            key={stage.key}
            className={cn("border-t-4 overflow-hidden", stage.color)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData("text/customer-id")
              if (id) moveCustomer(id, stage.key)
              setDraggingId(null)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {stage.label}
                </CardTitle>
                <Badge variant={stage.badge}>{column.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[120px] p-4 pt-0">
              {column.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Arrastra contactos aquí</p>
              ) : (
                column.map((customer) => (
                  <div
                    key={customer.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/customer-id", customer.id)
                      setDraggingId(customer.id)
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      "rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-opacity",
                      draggingId === customer.id && "opacity-50",
                      updatingId === customer.id && "opacity-60 pointer-events-none"
                    )}
                  >
                    <Link
                      href={`/dashboard/crm/${customer.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.name}
                    </Link>
                    {customer.email && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{customer.email}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>
                        {customer._count.projects} proy · {customer._count.invoices} fact
                      </span>
                      <span>{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
