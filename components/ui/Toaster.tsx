// components/ui/Toaster.tsx
"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface ToastItem {
  id:      string
  type:    ToastType
  title:   string
  message?: string
}

// Global event bus — works without context across any client component
type Listener = (t: ToastItem) => void
const listeners: Listener[] = []

function emit(t: ToastItem) {
  listeners.forEach(fn => fn(t))
}

// ── Public API — import `toast` anywhere in client components ─────────────
export const toast = {
  success: (title: string, message?: string) =>
    emit({ id: crypto.randomUUID(), type: "success", title, message }),
  error: (title: string, message?: string) =>
    emit({ id: crypto.randomUUID(), type: "error",   title, message }),
  info:  (title: string, message?: string) =>
    emit({ id: crypto.randomUUID(), type: "info",    title, message }),
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
  error:   <XCircle      size={16} className="text-red-500 shrink-0"     />,
  info:    <Info         size={16} className="text-brand-500 shrink-0"   />,
}

const ACCENT: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error:   "border-l-red-500",
  info:    "border-l-brand-500",
}

// ── Toaster — mount once in root layout ──────────────────────────────────
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const fn: Listener = (t) => {
      setItems(prev => [...prev, t])
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 4500)
    }
    listeners.push(fn)
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1) }
  }, [])

  if (!items.length) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0 sm:w-auto"
    >
      {items.map(t => (
        <div
          key={t.id}
          role="alert"
          className={`
            flex items-start gap-3 bg-white border border-surface-border border-l-4 ${ACCENT[t.type]}
            rounded-xl shadow-modal px-4 py-3 pointer-events-auto slide-in-from-right
          `}
        >
          <div className="mt-0.5">{ICONS[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-snug">{t.title}</p>
            {t.message && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{t.message}</p>
            )}
          </div>
          <button
            onClick={() => setItems(prev => prev.filter(x => x.id !== t.id))}
            className="text-text-muted hover:text-text-primary transition-colors shrink-0 mt-0.5"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
