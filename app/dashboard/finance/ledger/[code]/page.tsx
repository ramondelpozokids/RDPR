import { getActiveCompanyId } from "@/lib/company/context"
import { getAccountLedger } from "@/lib/accounting/ledger"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounting/pgc-accounts"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  INVOICE_ISSUE: "Factura",
  INVOICE_PAYMENT: "Cobro",
  EXPENSE_ISSUE: "Gasto",
  EXPENSE_PAYMENT: "Pago",
}

export default async function LedgerAccountPage({ params }: { params: { code: string } }) {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const ledger = await getAccountLedger(companyId, params.code)
  if (!ledger) notFound()

  const { account, movements, openingBalance, closingBalance } = ledger

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/dashboard/finance/ledger" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={12} /> Libro mayor
          </Link>
          <h1>
            <span className="font-mono text-primary">{account.code}</span> — {account.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS]} · {movements.length} movimiento(s)
          </p>
        </div>
        <ExportButton type="ledger" accountCode={account.code} />
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Saldo inicial</p>
          <p className="text-lg font-semibold mt-1">{formatCurrency(openingBalance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Saldo final</p>
          <p className="text-lg font-semibold mt-1">{formatCurrency(closingBalance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Movimientos</p>
          <p className="text-lg font-semibold mt-1">{movements.length}</p>
        </Card>
      </div>

      {movements.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground text-sm">Esta cuenta no tiene movimientos en el periodo.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Fecha</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Asiento</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Origen</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Debe</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Haber</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {openingBalance !== 0 && (
                <tr className="bg-muted/20">
                  <td className="px-5 py-2.5 text-muted-foreground" colSpan={3}>
                    Saldo inicial
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs">—</td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs">—</td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs font-semibold">{formatCurrency(openingBalance)}</td>
                </tr>
              )}
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-5 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(m.date)}</td>
                  <td className="px-5 py-2.5">
                    <p className="font-mono text-xs font-medium">{m.entryNumber}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.entryDescription}</p>
                  </td>
                  <td className="px-5 py-2.5 hidden sm:table-cell">
                    <Badge variant="muted">{SOURCE_LABELS[m.source] ?? m.source}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs">
                    {m.debit > 0 ? formatCurrency(m.debit) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs">
                    {m.credit > 0 ? formatCurrency(m.credit) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs font-semibold">{formatCurrency(m.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
