import { getJournalEntries, getChartOfAccounts, getVatQuarterReport } from "@/lib/accounting/reports"
import { getAccountLedger, getLedgerAccounts } from "@/lib/accounting/ledger"
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounting/pgc-accounts"
import { prisma } from "@/lib/prisma/client"

function escapeCsv(value: string | number): string {
  const s = String(value)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCsv).join(",")]
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(","))
  }
  return lines.join("\n")
}

export async function exportJournalCsv(companyId: string): Promise<string> {
  const entries = await getJournalEntries(companyId, 5000)
  const rows: (string | number)[][] = []

  for (const entry of entries) {
    for (const line of entry.lines) {
      rows.push([
        entry.number,
        entry.date.toISOString().slice(0, 10),
        entry.description,
        entry.source,
        line.account.code,
        line.account.name,
        line.debit.toFixed(2),
        line.credit.toFixed(2),
      ])
    }
  }

  return rowsToCsv(
    ["Asiento", "Fecha", "Descripción", "Origen", "Cuenta", "Nombre cuenta", "Debe", "Haber"],
    rows
  )
}

export async function exportAccountsCsv(companyId: string): Promise<string> {
  const accounts = await getChartOfAccounts(companyId)
  const rows = accounts.map((a) => [
    a.code,
    a.name,
    ACCOUNT_TYPE_LABELS[a.type as keyof typeof ACCOUNT_TYPE_LABELS] ?? a.type,
    a.debit.toFixed(2),
    a.credit.toFixed(2),
    a.balance.toFixed(2),
  ])
  return rowsToCsv(["Código", "Nombre", "Tipo", "Debe", "Haber", "Saldo"], rows)
}

export async function exportLedgerCsv(companyId: string, accountCode: string): Promise<string | null> {
  const ledger = await getAccountLedger(companyId, accountCode)
  if (!ledger) return null

  const rows: (string | number)[][] = [
    ["", "", "Saldo inicial", "", "", ledger.openingBalance.toFixed(2)],
    ...ledger.movements.map((m) => [
      m.date.toISOString().slice(0, 10),
      m.entryNumber,
      m.entryDescription,
      m.debit.toFixed(2),
      m.credit.toFixed(2),
      m.balance.toFixed(2),
    ]),
  ]

  return rowsToCsv(
    ["Fecha", "Asiento", "Descripción", "Debe", "Haber", "Saldo"],
    rows
  )
}

export async function exportAllLedgersCsv(companyId: string): Promise<string> {
  const accounts = await getLedgerAccounts(companyId)
  const rows: (string | number)[][] = []

  for (const acc of accounts) {
    const ledger = await getAccountLedger(companyId, acc.code)
    if (!ledger) continue
    for (const m of ledger.movements) {
      rows.push([
        acc.code,
        acc.name,
        m.date.toISOString().slice(0, 10),
        m.entryNumber,
        m.entryDescription,
        m.debit.toFixed(2),
        m.credit.toFixed(2),
        m.balance.toFixed(2),
      ])
    }
  }

  return rowsToCsv(
    ["Cuenta", "Nombre", "Fecha", "Asiento", "Descripción", "Debe", "Haber", "Saldo"],
    rows
  )
}

export async function exportVatCsv(companyId: string): Promise<string> {
  const report = await getVatQuarterReport(companyId)
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } })

  const summaryRows: (string | number)[][] = [
    ["Empresa", company?.name ?? ""],
    ["Trimestre desde", report.quarterStart.toISOString().slice(0, 10)],
    ["Base imponible", report.baseImponible.toFixed(2)],
    ["IVA repercutido", report.ivaRepercutido.toFixed(2)],
    ["IVA soportado", report.ivaSoportado.toFixed(2)],
    ["IVA neto (303)", report.ivaNeto.toFixed(2)],
    ["Facturas", report.invoiceCount],
    [],
  ]

  const invoiceRows = report.invoices.map((inv) => [
    inv.number,
    inv.issueDate.toISOString().slice(0, 10),
    inv.subtotal.toFixed(2),
    inv.taxAmount.toFixed(2),
    inv.total.toFixed(2),
  ])

  const header = summaryRows.map((r) => r.join(",")).join("\n")
  const invHeader = rowsToCsv(
    ["Número", "Fecha", "Base", "IVA", "Total"],
    invoiceRows
  )
  return `${header}\n${invHeader}`
}

export type ExportType = "journal" | "accounts" | "ledger" | "ledgers" | "vat"

export async function generateFinanceExport(
  companyId: string,
  type: ExportType,
  accountCode?: string
): Promise<{ csv: string; filename: string } | null> {
  const date = new Date().toISOString().slice(0, 10)

  switch (type) {
    case "journal":
      return { csv: await exportJournalCsv(companyId), filename: `libro-diario-${date}.csv` }
    case "accounts":
      return { csv: await exportAccountsCsv(companyId), filename: `plan-contable-${date}.csv` }
    case "ledger":
      if (!accountCode) return null
      const ledgerCsv = await exportLedgerCsv(companyId, accountCode)
      if (!ledgerCsv) return null
      return { csv: ledgerCsv, filename: `libro-mayor-${accountCode}-${date}.csv` }
    case "ledgers":
      return { csv: await exportAllLedgersCsv(companyId), filename: `libro-mayor-completo-${date}.csv` }
    case "vat":
      return { csv: await exportVatCsv(companyId), filename: `iva-trimestre-${date}.csv` }
    default:
      return null
  }
}
