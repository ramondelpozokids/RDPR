import { prisma } from "@/lib/prisma/client"
import { PGC_DEFAULT_ACCOUNTS, ACCOUNT_CODES, EXPENSE_CATEGORY_ACCOUNTS } from "@/lib/accounting/pgc-accounts"
import type { JournalSource } from "@prisma/client"

export async function ensureChartOfAccounts(companyId: string) {
  for (const acc of PGC_DEFAULT_ACCOUNTS) {
    await prisma.chartOfAccount.upsert({
      where: { companyId_code: { companyId, code: acc.code } },
      update: { name: acc.name, type: acc.type, active: true },
      create: { companyId, code: acc.code, name: acc.name, type: acc.type },
    })
  }
}

export async function getAccountMap(companyId: string) {
  await ensureChartOfAccounts(companyId)
  const accounts = await prisma.chartOfAccount.findMany({ where: { companyId, active: true } })
  return Object.fromEntries(accounts.map((a) => [a.code, a]))
}

async function nextJournalNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `AST-${year}-`
  const count = await prisma.journalEntry.count({
    where: { companyId, number: { startsWith: prefix } },
  })
  return `${prefix}${String(count + 1).padStart(4, "0")}`
}

type LineInput = { code: string; debit?: number; credit?: number; description?: string }

async function createBalancedEntry(
  companyId: string,
  opts: {
    date: Date
    description: string
    source: JournalSource
    sourceId?: string
    lines: LineInput[]
  }
) {
  const accountMap = await getAccountMap(companyId)
  const totalDebit = opts.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
  const totalCredit = opts.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("Asiento desbalanceado")
  }

  const number = await nextJournalNumber(companyId)

  return prisma.journalEntry.create({
    data: {
      companyId,
      number,
      date: opts.date,
      description: opts.description,
      source: opts.source,
      sourceId: opts.sourceId ?? null,
      lines: {
        create: opts.lines.map((l) => {
          const acc = accountMap[l.code]
          if (!acc) throw new Error(`Cuenta ${l.code} no encontrada`)
          return {
            accountId: acc.id,
            debit: l.debit ?? 0,
            credit: l.credit ?? 0,
            description: l.description,
          }
        }),
      },
    },
    include: { lines: { include: { account: true } } },
  })
}

export async function createInvoiceIssueEntry(invoice: {
  id: string
  companyId: string
  number: string
  issueDate: Date
  subtotal: number
  taxAmount: number
  total: number
  customer?: { name: string } | null
}) {
  const existing = await prisma.journalEntry.findUnique({
    where: {
      companyId_source_sourceId: {
        companyId: invoice.companyId,
        source: "INVOICE_ISSUE",
        sourceId: invoice.id,
      },
    },
  })
  if (existing) return existing

  return createBalancedEntry(invoice.companyId, {
    date: invoice.issueDate,
    description: `Emisión factura ${invoice.number}${invoice.customer ? ` — ${invoice.customer.name}` : ""}`,
    source: "INVOICE_ISSUE",
    sourceId: invoice.id,
    lines: [
      { code: ACCOUNT_CODES.CLIENTES, debit: invoice.total, description: "Debe clientes" },
      { code: ACCOUNT_CODES.INGRESOS_SERVICIOS, credit: invoice.subtotal, description: "Ingreso servicios" },
      { code: ACCOUNT_CODES.IVA_REPERCUTIDO, credit: invoice.taxAmount, description: "IVA repercutido" },
    ],
  })
}

export async function createInvoicePaymentEntry(invoice: {
  id: string
  companyId: string
  number: string
  paidAt: Date | null
  total: number
  customer?: { name: string } | null
}) {
  if (!invoice.paidAt) return null

  const existing = await prisma.journalEntry.findUnique({
    where: {
      companyId_source_sourceId: {
        companyId: invoice.companyId,
        source: "INVOICE_PAYMENT",
        sourceId: invoice.id,
      },
    },
  })
  if (existing) return existing

  return createBalancedEntry(invoice.companyId, {
    date: invoice.paidAt,
    description: `Cobro factura ${invoice.number}${invoice.customer ? ` — ${invoice.customer.name}` : ""}`,
    source: "INVOICE_PAYMENT",
    sourceId: invoice.id,
    lines: [
      { code: ACCOUNT_CODES.BANCOS, debit: invoice.total, description: "Entrada banco" },
      { code: ACCOUNT_CODES.CLIENTES, credit: invoice.total, description: "Cancela cliente" },
    ],
  })
}

export async function createExpenseIssueEntry(expense: {
  id: string
  companyId: string
  description: string
  vendor: string | null
  category: string
  issueDate: Date
  status: string
  subtotal: number
  taxAmount: number
  total: number
}) {
  const existing = await prisma.journalEntry.findUnique({
    where: {
      companyId_source_sourceId: {
        companyId: expense.companyId,
        source: "EXPENSE_ISSUE",
        sourceId: expense.id,
      },
    },
  })
  if (existing) return existing

  const expenseCode = EXPENSE_CATEGORY_ACCOUNTS[expense.category] ?? "629"
  const creditCode = expense.status === "PAID" ? ACCOUNT_CODES.BANCOS : ACCOUNT_CODES.PROVEEDORES

  return createBalancedEntry(expense.companyId, {
    date: expense.issueDate,
    description: `Gasto: ${expense.description}${expense.vendor ? ` — ${expense.vendor}` : ""}`,
    source: "EXPENSE_ISSUE",
    sourceId: expense.id,
    lines: [
      { code: expenseCode, debit: expense.subtotal, description: "Gasto" },
      { code: ACCOUNT_CODES.IVA_SOPORTADO, debit: expense.taxAmount, description: "IVA soportado" },
      { code: creditCode, credit: expense.total, description: expense.status === "PAID" ? "Pago banco" : "Proveedor" },
    ],
  })
}

export async function createExpensePaymentEntry(expense: {
  id: string
  companyId: string
  description: string
  vendor: string | null
  paidAt: Date | null
  total: number
}) {
  if (!expense.paidAt) return null

  const existing = await prisma.journalEntry.findUnique({
    where: {
      companyId_source_sourceId: {
        companyId: expense.companyId,
        source: "EXPENSE_PAYMENT",
        sourceId: expense.id,
      },
    },
  })
  if (existing) return existing

  return createBalancedEntry(expense.companyId, {
    date: expense.paidAt,
    description: `Pago gasto: ${expense.description}${expense.vendor ? ` — ${expense.vendor}` : ""}`,
    source: "EXPENSE_PAYMENT",
    sourceId: expense.id,
    lines: [
      { code: ACCOUNT_CODES.PROVEEDORES, debit: expense.total, description: "Cancela proveedor" },
      { code: ACCOUNT_CODES.BANCOS, credit: expense.total, description: "Salida banco" },
    ],
  })
}

export async function backfillExpenseJournalEntries(companyId: string) {
  await ensureChartOfAccounts(companyId)

  const expenses = await prisma.expense.findMany({
    where: { companyId, status: { not: "CANCELLED" } },
  })

  for (const exp of expenses) {
    await createExpenseIssueEntry(exp)
    if (exp.status === "PAID" && exp.paidAt) {
      // Si se registró como PAID directamente, el asiento de issue ya usó 572
      // Solo crear payment si pasó de PENDING a PAID (issue usó 400)
      const issueEntry = await prisma.journalEntry.findUnique({
        where: {
          companyId_source_sourceId: {
            companyId,
            source: "EXPENSE_ISSUE",
            sourceId: exp.id,
          },
        },
        include: { lines: { include: { account: true } } },
      })
      const creditedProviders = issueEntry?.lines.some(
        (l) => l.account.code === ACCOUNT_CODES.PROVEEDORES && l.credit > 0
      )
      if (creditedProviders) {
        await createExpensePaymentEntry(exp)
      }
    }
  }
}

export async function backfillAllJournalEntries(companyId: string) {
  await backfillInvoiceJournalEntries(companyId)
  await backfillExpenseJournalEntries(companyId)
}

/** Genera asientos contables para facturas existentes sin asiento. */
export async function backfillInvoiceJournalEntries(companyId: string) {
  await ensureChartOfAccounts(companyId)

  const invoices = await prisma.invoice.findMany({
    where: { companyId, status: { not: "CANCELLED" } },
    include: { customer: { select: { name: true } } },
  })

  for (const inv of invoices) {
    await createInvoiceIssueEntry(inv)
    if (inv.status === "PAID" && inv.paidAt) {
      await createInvoicePaymentEntry(inv)
    }
  }
}

export { createBalancedEntry, nextJournalNumber }
