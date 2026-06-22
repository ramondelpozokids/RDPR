import { getActiveCompanyId } from "@/lib/company/context"
import { getVatQuarterReport } from "@/lib/accounting/reports"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExportButton } from "@/components/finance/ExportButton"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Receipt, ArrowDownCircle, ArrowUpCircle, Calculator } from "lucide-react"

export default async function VatPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const report = await getVatQuarterReport(companyId)
  const qMonths = ["Ene–Mar", "Abr–Jun", "Jul–Sep", "Oct–Dic"]
  const qLabel = qMonths[Math.floor(report.quarterStart.getMonth() / 3)]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>IVA trimestre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estimación {qLabel} {report.quarterStart.getFullYear()} · Modelo 303 orientativo
          </p>
        </div>
        <ExportButton type="vat" label="Exportar 303" />
      </div>

      <FinanceNav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="IVA repercutido"
          value={formatCurrency(report.ivaRepercutido)}
          icon={ArrowUpCircle}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <MetricCard
          label="IVA soportado"
          value={formatCurrency(report.ivaSoportado)}
          icon={ArrowDownCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="IVA neto a ingresar"
          value={formatCurrency(report.ivaNeto)}
          icon={Calculator}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
        <MetricCard
          label="Base imponible"
          value={formatCurrency(report.baseImponible)}
          icon={Receipt}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen trimestral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Calculado desde el libro diario (cuenta 477 repercutido, 472 soportado) y {report.invoiceCount} factura(s)
            emitidas en el trimestre.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-amber-900 text-xs">
            Estimación orientativa para gestión interna. No sustituye la declaración oficial en la AEAT. Incluye IVA
            soportado de gastos registrados en Finanzas → Gastos.
          </div>
        </CardContent>
      </Card>

      {report.invoices.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Facturas del trimestre</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Número</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Base</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">IVA</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.invoices.map((inv) => (
                <tr key={inv.number} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs font-semibold">{inv.number}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(inv.issueDate)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{formatCurrency(inv.subtotal)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{formatCurrency(inv.taxAmount)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-semibold">{formatCurrency(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
