import { formatCurrency, formatDate, INVOICE_STATUS_LABELS } from "@/lib/utils"

export type InvoiceReminderData = {
  number: string
  total: number
  dueDate: Date | null
  issueDate: Date
  customer: { name: string; email: string | null }
  company: { name: string; email: string | null }
}

export function buildInvoiceReminder(data: InvoiceReminderData) {
  const subject = `Recordatorio de pago — Factura ${data.number}`

  const dueLine = data.dueDate
    ? `La fecha de vencimiento era el ${formatDate(data.dueDate)}.`
    : "Le rogamos proceda al pago a la mayor brevedad."

  const body = [
    `Estimado/a ${data.customer.name},`,
    "",
    `Le recordamos que la factura ${data.number} emitida el ${formatDate(data.issueDate)} por un importe de ${formatCurrency(data.total)} se encuentra pendiente de pago.`,
    "",
    dueLine,
    "",
    "Si ya ha realizado el pago, ignore este mensaje.",
    "",
    "Gracias,",
    data.company.name,
    data.company.email ?? "",
  ]
    .filter(Boolean)
    .join("\n")

  const mailto = data.customer.email
    ? `mailto:${encodeURIComponent(data.customer.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null

  return { subject, body, mailto }
}

export function reminderLabel(sentAt: Date | null) {
  if (!sentAt) return null
  return `Recordatorio enviado el ${formatDate(sentAt)}`
}
