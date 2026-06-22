import { prisma } from "@/lib/prisma/client"
import { createInvoicePaymentEntry, createExpensePaymentEntry } from "@/lib/accounting/journal"

export type MatchSuggestion = {
  transactionId: string
  type: "invoice" | "expense"
  targetId: string
  label: string
  amount: number
  score: number
}

export async function getMatchSuggestions(companyId: string, transactionId: string): Promise<MatchSuggestion[]> {
  const tx = await prisma.bankTransaction.findFirst({
    where: { id: transactionId, companyId, status: "UNMATCHED" },
  })
  if (!tx) return []

  const absAmount = Math.abs(tx.amount)
  const suggestions: MatchSuggestion[] = []

  if (tx.amount > 0) {
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ["PENDING", "OVERDUE"] },
        total: { gte: absAmount - 0.02, lte: absAmount + 0.02 },
      },
      include: { customer: { select: { name: true } } },
      take: 5,
    })
    for (const inv of invoices) {
      suggestions.push({
        transactionId: tx.id,
        type: "invoice",
        targetId: inv.id,
        label: `${inv.number} — ${inv.customer.name}`,
        amount: inv.total,
        score: 100,
      })
    }
  } else {
    const expenses = await prisma.expense.findMany({
      where: {
        companyId,
        status: "PENDING",
        total: { gte: absAmount - 0.02, lte: absAmount + 0.02 },
      },
      take: 5,
    })
    for (const exp of expenses) {
      suggestions.push({
        transactionId: tx.id,
        type: "expense",
        targetId: exp.id,
        label: `${exp.description}${exp.vendor ? ` — ${exp.vendor}` : ""}`,
        amount: exp.total,
        score: 100,
      })
    }
  }

  return suggestions.sort((a, b) => b.score - a.score)
}

export async function matchTransaction(
  companyId: string,
  transactionId: string,
  opts: { invoiceId?: string; expenseId?: string; ignore?: boolean }
) {
  const tx = await prisma.bankTransaction.findFirst({
    where: { id: transactionId, companyId },
  })
  if (!tx) throw new Error("Movimiento no encontrado")

  if (opts.ignore) {
    return prisma.bankTransaction.update({
      where: { id: transactionId },
      data: { status: "IGNORED", matchedInvoiceId: null, matchedExpenseId: null },
    })
  }

  if (opts.invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: opts.invoiceId, companyId },
      include: { customer: { select: { name: true } } },
    })
    if (!invoice) throw new Error("Factura no encontrada")

    const paidAt = tx.date
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paidAt },
    })
    await createInvoicePaymentEntry({ ...invoice, paidAt, customer: invoice.customer })

    return prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        status: "MATCHED",
        matchedInvoiceId: invoice.id,
        matchedExpenseId: null,
      },
    })
  }

  if (opts.expenseId) {
    const expense = await prisma.expense.findFirst({ where: { id: opts.expenseId, companyId } })
    if (!expense) throw new Error("Gasto no encontrado")

    const paidAt = tx.date
    await prisma.expense.update({
      where: { id: expense.id },
      data: { status: "PAID", paidAt },
    })
    await createExpensePaymentEntry({ ...expense, paidAt })

    return prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        status: "MATCHED",
        matchedExpenseId: expense.id,
        matchedInvoiceId: null,
      },
    })
  }

  throw new Error("Indica factura, gasto o ignorar")
}

export async function getBankBalance(companyId: string, bankAccountId?: string) {
  const where = { companyId, ...(bankAccountId ? { bankAccountId } : {}) }
  const txs = await prisma.bankTransaction.findMany({ where, select: { amount: true } })
  return txs.reduce((s, t) => s + t.amount, 0)
}
