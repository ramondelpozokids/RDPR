import { prisma } from "@/lib/prisma/client"

/** Marca como vencidas las facturas pendientes cuya fecha de vencimiento ya pasó. */
export async function syncOverdueInvoices(companyId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.invoice.updateMany({
    where: {
      companyId,
      status: "PENDING",
      dueDate: { lt: today },
    },
    data: { status: "OVERDUE" },
  })
}

export async function syncOverdueInvoicesAll() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.invoice.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: today },
    },
    data: { status: "OVERDUE" },
  })
}

export function initialInvoiceStatus(dueDate: Date | null | undefined): "PENDING" | "OVERDUE" {
  if (!dueDate) return "PENDING"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today ? "OVERDUE" : "PENDING"
}
