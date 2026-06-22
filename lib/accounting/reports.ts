import { prisma } from "@/lib/prisma/client"
import { formatCurrency } from "@/lib/utils"
import { ACCOUNT_CODES } from "@/lib/accounting/pgc-accounts"
import { backfillAllJournalEntries } from "@/lib/accounting/journal"

function quarterStart(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) * 3
  return new Date(d.getFullYear(), q, 1)
}

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

async function accountBalance(companyId: string, code: string, from?: Date, to?: Date) {
  const account = await prisma.chartOfAccount.findUnique({
    where: { companyId_code: { companyId, code } },
  })
  if (!account) return { debit: 0, credit: 0, balance: 0 }

  const lines = await prisma.journalLine.findMany({
    where: {
      accountId: account.id,
      entry: {
        companyId,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
    },
    select: { debit: true, credit: true },
  })

  const debit = lines.reduce((s, l) => s + l.debit, 0)
  const credit = lines.reduce((s, l) => s + l.credit, 0)

  // Activo/gasto: saldo deudor = debe - haber; Pasivo/ingreso: acreedor = haber - debe
  const isCreditNature = account.type === "LIABILITY" || account.type === "EQUITY" || account.type === "INCOME"
  const balance = isCreditNature ? credit - debit : debit - credit

  return { debit, credit, balance, account }
}

export async function getFinanceSummary(companyId: string) {
  await backfillAllJournalEntries(companyId)

  const now = new Date()
  const thisMonth = monthStart(now)
  const qStart = quarterStart(now)

  const [revenueMonth, revenueQuarter, expensesMonth, clientes, ivaRepercutido, ivaSoportado, entryCount] =
    await Promise.all([
      accountBalance(companyId, ACCOUNT_CODES.INGRESOS_SERVICIOS, thisMonth, now),
      accountBalance(companyId, ACCOUNT_CODES.INGRESOS_SERVICIOS, qStart, now),
      prisma.journalLine.aggregate({
        where: {
          account: { companyId, type: "EXPENSE" },
          entry: { companyId, date: { gte: thisMonth } },
        },
        _sum: { debit: true },
      }),
      accountBalance(companyId, ACCOUNT_CODES.CLIENTES),
      accountBalance(companyId, ACCOUNT_CODES.IVA_REPERCUTIDO, qStart, now),
      accountBalance(companyId, "472", qStart, now),
      prisma.journalEntry.count({ where: { companyId } }),
    ])

  const ingresosMes = revenueMonth.balance
  const ingresosTrimestre = revenueQuarter.balance
  const gastosMes = expensesMonth._sum.debit ?? 0
  const resultadoMes = ingresosMes - gastosMes
  const ivaNetoTrimestre = ivaRepercutido.balance - ivaSoportado.balance

  return {
    ingresosMes,
    ingresosTrimestre,
    gastosMes,
    resultadoMes,
    clientesPendiente: clientes.balance,
    ivaRepercutidoTrimestre: ivaRepercutido.balance,
    ivaSoportadoTrimestre: ivaSoportado.balance,
    ivaNetoTrimestre,
    journalEntryCount: entryCount,
    formatted: {
      ingresosMes: formatCurrency(ingresosMes),
      ingresosTrimestre: formatCurrency(ingresosTrimestre),
      gastosMes: formatCurrency(gastosMes),
      resultadoMes: formatCurrency(resultadoMes),
      clientesPendiente: formatCurrency(clientes.balance),
      ivaNetoTrimestre: formatCurrency(ivaNetoTrimestre),
    },
  }
}

export async function getJournalEntries(companyId: string, limit = 50) {
  await backfillAllJournalEntries(companyId)

  return prisma.journalEntry.findMany({
    where: { companyId },
    include: {
      lines: {
        include: { account: true },
        orderBy: { debit: "desc" },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  })
}

export async function getChartOfAccounts(companyId: string) {
  await backfillAllJournalEntries(companyId)

  const accounts = await prisma.chartOfAccount.findMany({
    where: { companyId, active: true },
    orderBy: { code: "asc" },
    include: {
      lines: {
        select: { debit: true, credit: true },
      },
    },
  })

  return accounts.map((a) => {
    const debit = a.lines.reduce((s, l) => s + l.debit, 0)
    const credit = a.lines.reduce((s, l) => s + l.credit, 0)
    const isCreditNature = a.type === "LIABILITY" || a.type === "EQUITY" || a.type === "INCOME"
    const balance = isCreditNature ? credit - debit : debit - credit
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      debit,
      credit,
      balance,
    }
  })
}

export async function getVatQuarterReport(companyId: string) {
  await backfillAllJournalEntries(companyId)

  const qStart = quarterStart()
  const now = new Date()

  const [repercutido, soportado, invoicesQuarter] = await Promise.all([
    accountBalance(companyId, ACCOUNT_CODES.IVA_REPERCUTIDO, qStart, now),
    accountBalance(companyId, "472", qStart, now),
    prisma.invoice.findMany({
      where: { companyId, issueDate: { gte: qStart }, status: { not: "CANCELLED" } },
      select: { number: true, subtotal: true, taxAmount: true, total: true, issueDate: true },
      orderBy: { issueDate: "desc" },
    }),
  ])

  const netVat = repercutido.balance - soportado.balance

  return {
    quarterStart: qStart,
    ivaRepercutido: repercutido.balance,
    ivaSoportado: soportado.balance,
    ivaNeto: netVat,
    baseImponible: invoicesQuarter.reduce((s, i) => s + i.subtotal, 0),
    invoiceCount: invoicesQuarter.length,
    invoices: invoicesQuarter,
    model303Estimate: netVat,
  }
}
