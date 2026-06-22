import { getActiveCompanyId } from "@/lib/company/context"
import { prisma } from "@/lib/prisma/client"
import { getBankBalance } from "@/lib/banking/reconcile"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { BankingPanel } from "@/components/finance/BankingPanel"
import { MetricCard } from "@/components/ui/metric-card"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Landmark, ArrowDownLeft, ArrowUpRight, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default async function BankingPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const [accounts, balance, recentTx, unmatched] = await Promise.all([
    prisma.bankAccount.findMany({ where: { companyId }, orderBy: { createdAt: "asc" } }),
    getBankBalance(companyId),
    prisma.bankTransaction.findMany({
      where: { companyId },
      include: { bankAccount: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 15,
    }),
    prisma.bankTransaction.count({ where: { companyId, status: "UNMATCHED" } }),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Banca</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Importa movimientos CSV y concilia con facturas y gastos
          </p>
        </div>
        {unmatched > 0 && (
          <Link href="/dashboard/finance/reconciliation" className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <LinkIcon size={14} />
            {unmatched} sin conciliar
          </Link>
        )}
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Saldo importado" value={formatCurrency(balance)} icon={Landmark} iconColor="text-primary" iconBg="bg-accent" />
        <MetricCard label="Cuentas" value={String(accounts.length)} icon={Landmark} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <MetricCard label="Sin conciliar" value={String(unmatched)} icon={LinkIcon} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <BankingPanel accounts={accounts} />

      {recentTx.length > 0 && (
        <Card className="mt-6 p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/50">
            <h2 className="text-sm font-semibold">Últimos movimientos</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2 text-muted-foreground font-medium">Fecha</th>
                <th className="text-left px-5 py-2 text-muted-foreground font-medium">Descripción</th>
                <th className="text-left px-5 py-2 text-muted-foreground font-medium hidden sm:table-cell">Cuenta</th>
                <th className="text-right px-5 py-2 text-muted-foreground font-medium">Importe</th>
                <th className="text-left px-5 py-2 text-muted-foreground font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30">
                  <td className="px-5 py-2 text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="px-5 py-2 font-medium">{tx.description}</td>
                  <td className="px-5 py-2 text-muted-foreground hidden sm:table-cell">{tx.bankAccount.name}</td>
                  <td className={`px-5 py-2 text-right font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      {tx.amount >= 0 ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-xs text-muted-foreground">{tx.status === "UNMATCHED" ? "Pendiente" : tx.status === "MATCHED" ? "Conciliado" : "Ignorado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
