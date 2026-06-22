import Link from "next/link"
import { getActiveCompanyId } from "@/lib/company/context"
import { getFinanceSummary } from "@/lib/accounting/reports"
import { getCashflowForecast } from "@/lib/accounting/insights"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { FINANCE_MODULE_CARD } from "@/lib/finance/structure"
import { BarChart3, TrendingUp, Wallet, FileText, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const REPORT_LINKS = [
  { href: "/dashboard/finance", label: "Resumen ejecutivo", desc: "P&L, tesorería y alertas IA" },
  { href: "/dashboard/finance/taxes", label: "Tax Intelligence", desc: "Modelos 303, 390, 130, 111, 200, 347" },
  { href: "/dashboard/finance/ledger", label: "Libro mayor", desc: "Saldos por cuenta PGC" },
  { href: "/dashboard/finance/journal", label: "Libro diario", desc: "Asientos completos" },
  { href: "/dashboard/finance/efactura", label: "Informe eFactura", desc: "Cumplimiento y huellas" },
  { href: "/dashboard/intelligence", label: "RDPR Intelligence", desc: "Consultas en lenguaje natural" },
]

export default async function FinanceReportsPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const [summary, cashflow] = await Promise.all([
    getFinanceSummary(companyId),
    getCashflowForecast(companyId),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Informes financieros</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {FINANCE_MODULE_CARD.title} · exportación y análisis
          </p>
        </div>
        <ExportButton type="ledgers" label="Exportar mayor" />
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Ingresos (mes)" value={summary.formatted.ingresosMes} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <MetricCard label="Resultado (mes)" value={summary.formatted.resultadoMes} icon={BarChart3} iconColor="text-primary" iconBg="bg-accent" />
        <MetricCard label="Proyección tesorería" value={formatCurrency(cashflow.projectedBalance)} icon={Wallet} iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {REPORT_LINKS.map(({ href, label, desc }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full hover:border-brand-200 hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                  {label}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} />
            Exportación contable
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExportButton type="journal" label="Libro diario" />
          <ExportButton type="ledgers" label="Libro mayor" />
          <ExportButton type="accounts" label="Plan contable" />
          <ExportButton type="vat" label="IVA trimestre" />
        </CardContent>
      </Card>
    </div>
  )
}
