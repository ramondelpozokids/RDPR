import { getActiveCompanyId } from "@/lib/company/context"
import { getFinanceSummary } from "@/lib/accounting/reports"
import { getAccountingInsights, getCashflowForecast } from "@/lib/accounting/insights"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { AccountingInsightsCard } from "@/components/finance/AccountingInsightsCard"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/finance/ExportButton"
import { TrendingUp, TrendingDown, Wallet, Receipt, BookOpen, ShoppingCart, Landmark, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react"
import { FINANCE_MODULE_CARD } from "@/lib/finance/structure"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function FinancePage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) {
    return <p className="text-muted-foreground text-sm">No autorizado</p>
  }

  const [summary, insights, cashflow] = await Promise.all([
    getFinanceSummary(companyId),
    getAccountingInsights(companyId),
    getCashflowForecast(companyId),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>RDPR Finance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Facturación · eFactura · Contabilidad · Tesorería · {summary.journalEntryCount} asiento(s)
          </p>
        </div>
        <Link href="/dashboard/finance/invoicing" className="btn-secondary text-sm">
          Facturación
        </Link>
      </div>

      <FinanceNav />

      <Card className="mb-6 border-brand-100 bg-gradient-to-r from-brand-50/50 to-violet-50/30">
        <CardContent className="py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-3">{FINANCE_MODULE_CARD.subtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FINANCE_MODULE_CARD.pillars.map((p) => (
              <div key={p.name} className="text-center sm:text-left">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Ingresos (mes)"
          value={summary.formatted.ingresosMes}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="Gastos (mes)"
          value={summary.formatted.gastosMes}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <MetricCard
          label="Resultado (mes)"
          value={summary.formatted.resultadoMes}
          icon={Wallet}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
        <MetricCard
          label="IVA neto trimestre"
          value={summary.formatted.ivaNetoTrimestre}
          icon={Receipt}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>P&amp;L simplificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Ingresos del mes</span>
              <span className="font-semibold text-emerald-600">{summary.formatted.ingresosMes}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Gastos del mes</span>
              <span className="font-semibold text-red-600">{summary.formatted.gastosMes}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="font-medium">Resultado del mes</span>
              <span className="font-bold">{summary.formatted.resultadoMes}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Ingresos trimestre</span>
              <span className="font-semibold">{summary.formatted.ingresosTrimestre}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flujo de caja proyectado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Landmark size={14} /> Saldo banco (importado)
              </span>
              <span className="font-semibold">{formatCurrency(cashflow.bankBalance)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <ArrowDownLeft size={14} className="text-emerald-600" /> Por cobrar
              </span>
              <span className="font-semibold text-emerald-600">{formatCurrency(cashflow.pendingIn)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-red-600" /> Por pagar
              </span>
              <span className="font-semibold text-red-600">{formatCurrency(cashflow.pendingOut)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Proyección</span>
              <span className={`font-bold ${cashflow.projectedBalance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(cashflow.projectedBalance)}
              </span>
            </div>
            <Link href="/dashboard/finance/banking" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-2">
              <Landmark size={14} />
              Importar movimientos bancarios
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AccountingInsightsCard insights={insights} />

        <Card>
          <CardHeader>
            <CardTitle>Tesorería y cobros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Clientes pendientes (430)</span>
              <span className="font-semibold text-amber-600">{summary.formatted.clientesPendiente}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">IVA neto trimestre</span>
              <span className="font-semibold">{summary.formatted.ivaNetoTrimestre}</span>
            </div>
            {cashflow.unmatchedTx > 0 && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Movimientos sin conciliar</span>
                <span className="font-semibold text-amber-600">{cashflow.unmatchedTx}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Asientos automáticos: facturas (430/705/477) y gastos (629/472/400).
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/dashboard/finance/expenses" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <ShoppingCart size={14} />
                Gastos
              </Link>
              <Link href="/dashboard/finance/journal" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <BookOpen size={14} />
                Libro diario
              </Link>
              <Link href="/dashboard/finance/reconciliation" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Conciliación
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={16} />
            Exportación contable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Descarga CSV para gestoría, Excel o backup. Compatible con importación en hojas de cálculo.
          </p>
          <div className="flex flex-wrap gap-2">
            <ExportButton type="journal" label="Libro diario" />
            <ExportButton type="ledgers" label="Libro mayor" />
            <ExportButton type="accounts" label="Plan contable" />
            <Link href="/dashboard/finance/taxes" className="btn-secondary text-sm">
              Tax Intelligence
            </Link>
            <ExportButton type="vat" label="Exportar 303" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
