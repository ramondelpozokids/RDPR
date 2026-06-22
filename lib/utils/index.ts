// lib/utils/index.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// ── Clases CSS ────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formateo de moneda ────────────────────────
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount)
}

// ── Formateo de fecha ─────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy", { locale: es })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: es })
}

// ── Número de factura ─────────────────────────
export function generateInvoiceNumber(sequence: number, year?: number): string {
  const y = year ?? new Date().getFullYear()
  return `FAC-${y}-${String(sequence).padStart(4, "0")}`
}

// ── Formateo de tamaño de archivo ─────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Iniciales de usuario ──────────────────────
export function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// ── Etiquetas de estado ───────────────────────
export const PIPELINE_LABELS: Record<string, string> = {
  NEW_CONTACT:  "Nuevo contacto",
  QUOTE_SENT:   "Presupuesto enviado",
  CLIENT_WON:   "Cliente ganado",
  CLIENT_LOST:  "Cliente perdido",
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PENDING:     "Pendiente",
  IN_PROGRESS: "En proceso",
  COMPLETED:   "Finalizado",
  CANCELLED:   "Cancelado",
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pendiente",
  PAID:      "Pagada",
  OVERDUE:   "Vencida",
  CANCELLED: "Cancelada",
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW:    "Baja",
  MEDIUM: "Media",
  HIGH:   "Alta",
  URGENT: "Urgente",
}
