"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "@/components/ui/Toaster"
import { DropdownMenu } from "@/components/ui"
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Download,
  Mail,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Props {
  invoiceId: string
  currentStatus: string
  customerEmail: string | null
  reminderSentAt: string | null
}

export default function InvoiceActions({
  invoiceId,
  currentStatus,
  customerEmail,
  reminderSentAt,
}: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [delOpen, setDelOpen] = useState(false)

  async function changeStatus(status: string, label: string) {
    setBusy(true)
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(label)
      router.refresh()
    } else {
      toast.error("Error al actualizar")
    }
    setBusy(false)
  }

  async function handleDelete() {
    setBusy(true)
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Factura eliminada")
      router.refresh()
    } else {
      toast.error("Error al eliminar")
    }
    setBusy(false)
    setDelOpen(false)
  }

  async function sendReminder() {
    if (!customerEmail) {
      toast.error("El cliente no tiene email registrado")
      return
    }
    setBusy(true)
    const res = await fetch(`/api/invoices/${invoiceId}/remind`, { method: "POST" })
    const json = await res.json()
    if (res.ok && json.data?.mailto) {
      window.location.href = json.data.mailto
      toast.success("Recordatorio preparado en tu cliente de email")
      router.refresh()
    } else {
      toast.error(json.error ?? "Error al preparar recordatorio")
    }
    setBusy(false)
  }

  const canRemind =
    (currentStatus === "PENDING" || currentStatus === "OVERDUE") && customerEmail

  const menuItems = [
    ...(canRemind
      ? [
          {
            label: reminderSentAt ? "Reenviar recordatorio" : "Enviar recordatorio",
            icon: <Mail size={14} className="text-primary" />,
            onClick: sendReminder,
          },
        ]
      : []),
    ...(currentStatus !== "PAID"
      ? [
          {
            label: "Marcar como pagada",
            icon: <CheckCircle size={14} className="text-emerald-500" />,
            onClick: () => changeStatus("PAID", "Factura marcada como pagada"),
          },
        ]
      : []),
    ...(currentStatus !== "OVERDUE" && currentStatus !== "PAID"
      ? [
          {
            label: "Marcar como vencida",
            icon: <AlertCircle size={14} className="text-amber-500" />,
            onClick: () => changeStatus("OVERDUE", "Factura marcada como vencida"),
          },
        ]
      : []),
    ...(currentStatus !== "PENDING" && currentStatus !== "PAID"
      ? [
          {
            label: "Volver a pendiente",
            icon: <XCircle size={14} className="text-muted-foreground" />,
            onClick: () => changeStatus("PENDING", "Factura reactivada"),
          },
        ]
      : []),
    {
      label: "Eliminar factura",
      icon: <Trash2 size={14} />,
      onClick: () => setDelOpen(true),
      danger: true,
      divider: true,
    },
  ]

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:opacity-80 font-medium"
          title="Vista previa"
        >
          Ver <ExternalLink size={11} />
        </a>
        <a
          href={`/api/invoices/${invoiceId}/pdf?format=pdf&download=1`}
          className="flex items-center gap-1 text-xs text-primary hover:opacity-80 font-medium"
          title="Descargar PDF"
        >
          PDF <Download size={11} />
        </a>

        <DropdownMenu
          trigger={
            <button disabled={busy} className="btn-icon disabled:opacity-40" title="Más opciones">
              <MoreHorizontal size={15} />
            </button>
          }
          items={menuItems}
        />
      </div>

      {reminderSentAt && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Recordatorio: {formatDate(reminderSentAt)}
        </p>
      )}

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
