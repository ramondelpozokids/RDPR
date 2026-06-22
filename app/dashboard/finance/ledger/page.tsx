import { getActiveCompanyId } from "@/lib/company/context"
import { getLedgerAccounts } from "@/lib/accounting/ledger"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounting/pgc-accounts"
import Link from "next/link"
import type { AccountType } from "@prisma/client"

const TYPE_BADGE: Record<AccountType, "info" | "warning" | "success" | "muted" | "destructive"> = {
  ASSET: "info",
  LIABILITY: "warning",
  EQUITY: "muted",
  INCOME: "success",
  EXPENSE: "destructive",
}

export default async function LedgerPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const accounts = await getLedgerAccounts(companyId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Libro mayor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Movimientos por cuenta con saldo acumulado · {accounts.length} cuenta(s) con movimiento
          </p>
        </div>
        <ExportButton type="ledgers" label="Exportar todo" />
      </div>

      <FinanceNav />

      {accounts.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-muted-foreground text-sm">Sin movimientos todavía. Emite una factura o registra un gasto.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Cuenta</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Nombre</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Tipo</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium hidden md:table-cell">Movimientos</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Saldo</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{a.code}</td>
                  <td className="px-5 py-3 text-foreground">{a.name}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <Badge variant={TYPE_BADGE[a.type as AccountType]}>{ACCOUNT_TYPE_LABELS[a.type as AccountType]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground hidden md:table-cell">{a.movementCount}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-semibold">{formatCurrency(a.balance)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/dashboard/finance/ledger/${a.code}`} className="text-xs text-primary font-medium hover:underline">
                      Ver mayor
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
