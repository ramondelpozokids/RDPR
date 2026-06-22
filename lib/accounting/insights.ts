import { prisma } from "@/lib/prisma/client"
import { formatCurrency } from "@/lib/utils"
import { getBankBalance } from "@/lib/banking/reconcile"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"
import { ACCOUNT_CODES } from "@/lib/accounting/pgc-accounts"
import { backfillAllJournalEntries } from "@/lib/accounting/journal"

export type AccountingInsight = {
  id: string
  type: "warning" | "info" | "success" | "danger"
  title: string
  description: string
  href?: string
}

export type CashflowForecast = {
  bankBalance: number
  pendingIn: number
  pendingOut: number
  projectedBalance: number
  overdueInvoices: number
  unmatchedTx: number
}

export async function getAccountingInsights(companyId: string): Promise<AccountingInsight[]> {
  await syncOverdueInvoices(companyId)
  await backfillAllJournalEntries(companyId)

  const insights: AccountingInsight[] = []
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000)

  const [
    unmatched,
    oldUnmatched,
    overdue,
    pendingInvoices,
    expenseRows,
    oldPendingExpenses,
    invoicesNoJournal,
    expensesNoJournal,
    unbalancedEntries,
    bankTxCount,
    account572,
    account430,
    pendingExpensesAgg,
    revenueMonth,
  ] = await Promise.all([
    prisma.bankTransaction.count({ where: { companyId, status: "UNMATCHED" } }),
    prisma.bankTransaction.count({
      where: { companyId, status: "UNMATCHED", date: { lt: thirtyDaysAgo } },
    }),
    prisma.invoice.count({ where: { companyId, status: "OVERDUE" } }),
    prisma.invoice.aggregate({
      where: { companyId, status: "PENDING" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.expense.findMany({
      where: { companyId, status: { not: "CANCELLED" }, vendor: { not: null } },
      select: { vendor: true, total: true, issueDate: true },
    }),
    prisma.expense.count({
      where: { companyId, status: "PENDING", issueDate: { lt: sixtyDaysAgo } },
    }),
    Promise.all([
      prisma.invoice.findMany({
        where: { companyId, status: { not: "CANCELLED" } },
        select: { id: true },
      }),
      prisma.journalEntry.findMany({
        where: { companyId, source: "INVOICE_ISSUE" },
        select: { sourceId: true },
      }),
    ]).then(([invoices, entries]) => {
      const journaled = new Set(entries.map((e) => e.sourceId).filter(Boolean))
      return invoices.filter((i) => !journaled.has(i.id)).length
    }),
    Promise.all([
      prisma.expense.findMany({
        where: { companyId, status: { not: "CANCELLED" } },
        select: { id: true },
      }),
      prisma.journalEntry.findMany({
        where: { companyId, source: "EXPENSE_ISSUE" },
        select: { sourceId: true },
      }),
    ]).then(([expenses, entries]) => {
      const journaled = new Set(entries.map((e) => e.sourceId).filter(Boolean))
      return expenses.filter((e) => !journaled.has(e.id)).length
    }),
    prisma.journalEntry.findMany({
      where: { companyId },
      include: { lines: { select: { debit: true, credit: true } } },
      take: 500,
    }).then((entries) =>
      entries.filter((e) => {
        const d = e.lines.reduce((s, l) => s + l.debit, 0)
        const c = e.lines.reduce((s, l) => s + l.credit, 0)
        return Math.abs(d - c) > 0.01
      }).length
    ),
    prisma.bankTransaction.count({ where: { companyId } }),
    prisma.chartOfAccount.findUnique({
      where: { companyId_code: { companyId, code: ACCOUNT_CODES.BANCOS } },
      include: { lines: { select: { debit: true, credit: true } } },
    }),
    prisma.chartOfAccount.findUnique({
      where: { companyId_code: { companyId, code: ACCOUNT_CODES.CLIENTES } },
      include: { lines: { select: { debit: true, credit: true } } },
    }),
    prisma.expense.aggregate({
      where: { companyId, status: "PENDING" },
      _sum: { total: true },
    }),
    prisma.journalLine.aggregate({
      where: {
        account: { companyId, code: ACCOUNT_CODES.INGRESOS_SERVICIOS },
        entry: {
          companyId,
          date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      },
      _sum: { credit: true },
    }),
  ])

  const dupKeys = new Map<string, number>()
  for (const e of expenseRows) {
    const key = `${e.vendor}|${e.total}|${e.issueDate.toISOString().slice(0, 10)}`
    dupKeys.set(key, (dupKeys.get(key) ?? 0) + 1)
  }
  const dupCount = [...dupKeys.values()].filter((c) => c > 1).length
  const bankBalanceForInsights = await getBankBalance(companyId)

  if (overdue > 0) {
    insights.push({
      id: "overdue-invoices",
      type: "danger",
      title: `${overdue} factura(s) vencida(s)`,
      description: "Revisa cobros pendientes y envía recordatorios desde Facturación.",
      href: "/dashboard/invoices",
    })
  }

  if (unmatched > 0) {
    insights.push({
      id: "unmatched-bank",
      type: "warning",
      title: `${unmatched} movimiento(s) sin conciliar`,
      description: oldUnmatched > 0
        ? `${oldUnmatched} llevan más de 30 días sin conciliar.`
        : "Concilia movimientos bancarios con facturas y gastos.",
      href: "/dashboard/finance/reconciliation",
    })
  }

  if ((pendingInvoices._count ?? 0) > 0) {
    insights.push({
      id: "pending-collections",
      type: "info",
      title: `${formatCurrency(pendingInvoices._sum.total ?? 0)} por cobrar`,
      description: `${pendingInvoices._count} factura(s) pendientes de cobro.`,
      href: "/dashboard/invoices",
    })
  }

  // Gastos duplicados potenciales (mismo proveedor, importe y día)
  if (dupCount > 0) {
    insights.push({
      id: "duplicate-expenses",
      type: "warning",
      title: "Posibles gastos duplicados",
      description: `Detectados ${dupCount} grupo(s) con mismo proveedor e importe. Revisa antes de cerrar el trimestre.`,
      href: "/dashboard/finance/expenses",
    })
  }

  if (oldPendingExpenses > 0) {
    insights.push({
      id: "old-pending-expenses",
      type: "warning",
      title: `${oldPendingExpenses} gasto(s) pendientes antiguos`,
      description: "Hay pagos a proveedores con más de 60 días sin liquidar.",
      href: "/dashboard/finance/expenses",
    })
  }

  if (invoicesNoJournal > 0) {
    insights.push({
      id: "invoices-no-journal",
      type: "danger",
      title: "Facturas sin asiento contable",
      description: `${invoicesNoJournal} factura(s) no tienen asiento de emisión. Ejecuta sincronización desde Gastos o contacta soporte.`,
      href: "/dashboard/finance/journal",
    })
  }

  if (expensesNoJournal > 0) {
    insights.push({
      id: "expenses-no-journal",
      type: "danger",
      title: "Gastos sin asiento contable",
      description: `${expensesNoJournal} gasto(s) sin asiento registrado en el diario.`,
      href: "/dashboard/finance/expenses",
    })
  }

  if (unbalancedEntries > 0) {
    insights.push({
      id: "unbalanced-entries",
      type: "danger",
      title: "Asientos desequilibrados",
      description: `${unbalancedEntries} asiento(s) con Debe ≠ Haber. Revisa integridad contable.`,
      href: "/dashboard/finance/journal",
    })
  }

  if (bankTxCount > 0 && account572) {
    const b572Debit = account572.lines.reduce((s, l) => s + l.debit, 0)
    const b572Credit = account572.lines.reduce((s, l) => s + l.credit, 0)
    const ledger572 = b572Debit - b572Credit
    const importedBank = bankBalanceForInsights
    const diff = Math.abs(ledger572 - importedBank)
    if (diff > 1) {
      insights.push({
        id: "bank-572-mismatch",
        type: "warning",
        title: "Descuadre banco contable vs importado",
        description: `Cuenta 572: ${formatCurrency(ledger572)} · Importado: ${formatCurrency(importedBank)} · Diferencia: ${formatCurrency(diff)}.`,
        href: "/dashboard/finance/reconciliation",
      })
    }
  }

  const ingresosMes = revenueMonth._sum.credit ?? 0
  const pendingOutTotal = pendingExpensesAgg._sum.total ?? 0
  if (pendingOutTotal > 0 && ingresosMes > 0 && pendingOutTotal > ingresosMes * 1.5) {
    insights.push({
      id: "high-payables-ratio",
      type: "warning",
      title: "Pagos pendientes elevados",
      description: `Gastos por pagar (${formatCurrency(pendingOutTotal)}) superan el 150% de ingresos del mes.`,
      href: "/dashboard/finance/expenses",
    })
  }

  if (account430 && (pendingInvoices._sum.total ?? 0) > 0) {
    const c430Debit = account430.lines.reduce((s, l) => s + l.debit, 0)
    const c430Credit = account430.lines.reduce((s, l) => s + l.credit, 0)
    const saldo430 = c430Debit - c430Credit
    const pendingTotal = pendingInvoices._sum.total ?? 0
    if (Math.abs(saldo430 - pendingTotal) > 1 && saldo430 > pendingTotal * 1.2) {
      insights.push({
        id: "clients-430-high",
        type: "info",
        title: "Saldo clientes (430) elevado",
        description: `Cuenta 430: ${formatCurrency(saldo430)} vs ${formatCurrency(pendingTotal)} pendiente en facturas. Puede haber cobros parciales o facturas antiguas.`,
        href: "/dashboard/finance/ledger/430",
      })
    }
  }

  const bankBalance = bankBalanceForInsights
  const pendingOut = pendingExpensesAgg
  const projected = bankBalance + (pendingInvoices._sum.total ?? 0) - (pendingOut._sum.total ?? 0)

  if (projected < 0) {
    insights.push({
      id: "cashflow-risk",
      type: "danger",
      title: "Riesgo de tesorería",
      description: `Saldo proyectado negativo (${formatCurrency(projected)}). Revisa cobros y pagos pendientes.`,
      href: "/dashboard/finance",
    })
  } else if (projected > 0 && (pendingInvoices._sum.total ?? 0) > 0) {
    insights.push({
      id: "cashflow-ok",
      type: "success",
      title: "Tesorería estable",
      description: `Saldo banco ${formatCurrency(bankBalance)} · Proyección con cobros: ${formatCurrency(projected)}.`,
      href: "/dashboard/finance/reconciliation",
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: "all-clear",
      type: "success",
      title: "Sin alertas contables",
      description: "No se detectaron anomalías. Importa movimientos bancarios para más precisión.",
      href: "/dashboard/finance/banking",
    })
  }

  return insights
}

export async function getCashflowForecast(companyId: string): Promise<CashflowForecast> {
  await syncOverdueInvoices(companyId)

  const [bankBalance, pendingIn, pendingOut, overdueInvoices, unmatchedTx] = await Promise.all([
    getBankBalance(companyId),
    prisma.invoice.aggregate({
      where: { companyId, status: { in: ["PENDING", "OVERDUE"] } },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: { companyId, status: "PENDING" },
      _sum: { total: true },
    }),
    prisma.invoice.count({ where: { companyId, status: "OVERDUE" } }),
    prisma.bankTransaction.count({ where: { companyId, status: "UNMATCHED" } }),
  ])

  const inAmt = pendingIn._sum.total ?? 0
  const outAmt = pendingOut._sum.total ?? 0

  return {
    bankBalance,
    pendingIn: inAmt,
    pendingOut: outAmt,
    projectedBalance: bankBalance + inAmt - outAmt,
    overdueInvoices,
    unmatchedTx,
  }
}
