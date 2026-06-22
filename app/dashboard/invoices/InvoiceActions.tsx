// app/(dashboard)/invoices/InvoiceActions.tsx
"use client"

import { useState }     from "react"
import { useRouter }    from "next/navigation"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast }         from "@/components/ui/Toaster"
import { DropdownMenu }  from "@/components/ui"
import {
  MoreHorizontal, CheckCircle, XCircle,
  AlertCircle, ExternalLink, Trash2,
} from "lucide-react"

interface Props { invoiceId: string; currentStatus: string }

export default function InvoiceActions({ invoiceId, currentStatus }: Props) {
  const router   = useRouter()
  const [busy,   setBusy]   = useState(false)
  const [delOpen, setDelOpen] = useState(false)

  async function changeStatus(status: string, label: string) {
    setBusy(true)
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success(label); router.refresh() }
    else { toast.error("Error al actualizar") }
    setBusy(false)
  }

  async function handleDelete() {
    setBusy(true)
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" })
    if (res.ok) { toast.success("Factura eliminada"); router.refresh() }
    else { toast.error("Error al eliminar") }
    setBusy(false)
    setDelOpen(false)
  }

  const menuItems = [
    ...(currentStatus !== "PAID"
      ? [{ label: "Marcar como pagada", icon: <CheckCircle size={14} className="text-emerald-500" />, onClick: () => changeStatus("PAID", "Factura marcada como pagada") }]
      : []),
    ...(currentStatus !== "OVERDUE"
      ? [{ label: "Marcar como vencida", icon: <AlertCircle size={14} className="text-amber-500" />, onClick: () => changeStatus("OVERDUE", "Factura marcada como vencida") }]
      : []),
    ...(currentStatus !== "PENDING"
      ? [{ label: "Volver a pendiente", icon: <XCircle size={14} className="text-text-muted" />, onClick: () => changeStatus("PENDING", "Factura reactivada") }]
      : []),
    { label: "Eliminar factura", icon: <Trash2 size={14} />, onClick: () => setDelOpen(true), danger: true, divider: true },
  ]

  return (
    <>
      <div className="flex items-center gap-3">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline"
        >
          PDF <ExternalLink size={11} />
        </a>

        <DropdownMenu
          trigger={
            <button
              disabled={busy}
              className="btn-icon disabled:opacity-40"
              title="Más opciones"
            >
              <MoreHorizontal size={15} />
            </button>
          }
          items={menuItems}
        />
      </div>

      <ConfirmDialog
        open={delOpen}
        title="Eliminar factura"
        message="¿Eliminar esta factura? Esta acción no se puede deshacer."
        confirm="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDelOpen(false)}
      />
    </>
  )
}
