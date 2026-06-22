// components/ui/ConfirmDialog.tsx
"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

interface Props {
  open:     boolean
  title:    string
  message:  string
  confirm?: string
  danger?:  boolean
  onConfirm: () => void
  onCancel:  () => void
}

export function ConfirmDialog({
  open, title, message, confirm = "Confirmar", danger = false,
  onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
      if (e.key === "Enter")  onConfirm()
    }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm animate-in">
        <div className="p-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
            danger ? "bg-red-50" : "bg-amber-50"
          }`}>
            <AlertTriangle size={18} className={danger ? "text-red-500" : "text-amber-500"} />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 justify-center"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 justify-center ${danger ? "btn-danger" : "btn-primary"}`}
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
