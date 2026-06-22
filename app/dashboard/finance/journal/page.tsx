import { getActiveCompanyId } from "@/lib/company/context"
import { getJournalEntries } from "@/lib/accounting/reports"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  INVOICE_ISSUE: "Factura emitida",
  INVOICE_PAYMENT: "Cobro factura",
  EXPENSE_ISSUE: "Gasto registrado",
  EXPENSE_PAYMENT: "Pago gasto",
}

export default async function JournalPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const entries = await getJournalEntries(companyId, 100)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Libro diario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{entries.length} asiento(s) recientes</p>
        </div>
        <ExportButton type="journal" />
      </div>

      <FinanceNav />

      {entries.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-muted-foreground text-sm">Sin asientos todavía. Crea una factura para generar el primer asiento.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
            return (
              <Card key={entry.id} className="p-0 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30">
                  <div>
                    <p className="font-mono text-xs font-semibold text-foreground">{entry.number}</p>
                    <p className="text-sm text-foreground mt-0.5">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="muted">{SOURCE_LABELS[entry.source] ?? entry.source}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left px-5 py-2 font-medium">Cuenta</th>
                      <th className="text-right px-5 py-2 font-medium">Debe</th>
                      <th className="text-right px-5 py-2 font-medium">Haber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-muted/20">
                        <td className="px-5 py-2.5">
                          <span className="font-mono text-xs text-primary mr-2">{line.account.code}</span>
                          <span className="text-foreground">{line.account.name}</span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-xs">
                          {line.debit > 0 ? formatCurrency(line.debit) : "—"}
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-xs">
                          {line.credit > 0 ? formatCurrency(line.credit) : "—"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/20 font-semibold">
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">Total asiento</td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs">{formatCurrency(totalDebit)}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs">{formatCurrency(totalDebit)}</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
