import { getActiveCompanyId } from "@/lib/company/context"
import { getChartOfAccounts } from "@/lib/accounting/reports"
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounting/pgc-accounts"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import type { AccountType } from "@prisma/client"

const TYPE_BADGE: Record<AccountType, "info" | "warning" | "success" | "muted" | "destructive"> = {
  ASSET: "info",
  LIABILITY: "warning",
  EQUITY: "muted",
  INCOME: "success",
  EXPENSE: "destructive",
}

export default async function AccountsPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const accounts = await getChartOfAccounts(companyId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Plan contable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">PGC español simplificado · {accounts.length} cuentas</p>
        </div>
        <ExportButton type="accounts" />
      </div>

      <FinanceNav />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Código</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Nombre</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Tipo</th>
              <th className="text-right px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Debe</th>
              <th className="text-right px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Haber</th>
              <th className="text-right px-5 py-3 text-muted-foreground font-medium">Saldo</th>
              <th className="text-right px-5 py-3 text-muted-foreground font-medium">Mayor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{a.code}</td>
                <td className="px-5 py-3 text-foreground">{a.name}</td>
                <td className="px-5 py-3">
                  <Badge variant={TYPE_BADGE[a.type]}>{ACCOUNT_TYPE_LABELS[a.type]}</Badge>
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                  {formatCurrency(a.debit)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                  {formatCurrency(a.credit)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs font-semibold">
                  {formatCurrency(a.balance)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/dashboard/finance/ledger/${a.code}`} className="text-xs text-primary font-medium hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
