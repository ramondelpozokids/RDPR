import { prisma } from "@/lib/prisma/client"
import { backfillAllJournalEntries } from "@/lib/accounting/journal"

export type LedgerMovement = {
  id: string
  date: Date
  entryNumber: string
  entryDescription: string
  lineDescription: string | null
  debit: number
  credit: number
  balance: number
  source: string
}

export type LedgerAccountSummary = {
  id: string
  code: string
  name: string
  type: string
  movementCount: number
  debit: number
  credit: number
  balance: number
}

function isCreditNature(type: string) {
  return type === "LIABILITY" || type === "EQUITY" || type === "INCOME"
}

function lineBalance(debit: number, credit: number, creditNature: boolean) {
  return creditNature ? credit - debit : debit - credit
}

export async function getLedgerAccounts(companyId: string): Promise<LedgerAccountSummary[]> {
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

  return accounts
    .map((a) => {
      const debit = a.lines.reduce((s, l) => s + l.debit, 0)
      const credit = a.lines.reduce((s, l) => s + l.credit, 0)
      const cn = isCreditNature(a.type)
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        movementCount: a.lines.length,
        debit,
        credit,
        balance: lineBalance(debit, credit, cn),
      }
    })
    .filter((a) => a.movementCount > 0 || Math.abs(a.balance) > 0.001)
}

export async function getAccountLedger(
  companyId: string,
  accountCode: string,
  opts?: { from?: Date; to?: Date }
): Promise<{ account: { code: string; name: string; type: string }; movements: LedgerMovement[]; openingBalance: number; closingBalance: number } | null> {
  await backfillAllJournalEntries(companyId)

  const account = await prisma.chartOfAccount.findUnique({
    where: { companyId_code: { companyId, code: accountCode } },
  })
  if (!account) return null

  const creditNature = isCreditNature(account.type)

  const priorLines = opts?.from
    ? await prisma.journalLine.findMany({
        where: {
          accountId: account.id,
          entry: { companyId, date: { lt: opts.from } },
        },
        select: { debit: true, credit: true },
      })
    : []

  const openingBalance = priorLines.reduce(
    (s, l) => s + lineBalance(l.debit, l.credit, creditNature),
    0
  )

  const lines = await prisma.journalLine.findMany({
    where: {
      accountId: account.id,
      entry: {
        companyId,
        ...(opts?.from || opts?.to
          ? {
              date: {
                ...(opts.from ? { gte: opts.from } : {}),
                ...(opts.to ? { lte: opts.to } : {}),
              },
            }
          : {}),
      },
    },
    include: {
      entry: { select: { number: true, date: true, description: true, source: true } },
    },
    orderBy: [{ entry: { date: "asc" } }, { entry: { createdAt: "asc" } }],
  })

  let running = openingBalance
  const movements: LedgerMovement[] = lines.map((line) => {
    running += lineBalance(line.debit, line.credit, creditNature)
    return {
      id: line.id,
      date: line.entry.date,
      entryNumber: line.entry.number,
      entryDescription: line.entry.description,
      lineDescription: line.description,
      debit: line.debit,
      credit: line.credit,
      balance: running,
      source: line.entry.source,
    }
  })

  return {
    account: { code: account.code, name: account.name, type: account.type },
    movements,
    openingBalance,
    closingBalance: running,
  }
}
