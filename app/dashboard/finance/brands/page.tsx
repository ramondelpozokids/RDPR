import Link from "next/link"
import { getActiveCompanyId } from "@/lib/company/context"
import { getBrandRevenueReport } from "@/lib/brands/revenue"
import { BRAND_TYPE_LABELS } from "@/lib/brands/catalog"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Tag, TrendingUp, Wallet, Clock, FileDown } from "lucide-react"

export default async function BrandRevenuePage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const report = await getBrandRevenueReport(companyId)
  const maxShare = Math.max(...report.rows.map((r) => r.collectedMonth), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ingresos por marca</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trazabilidad comercial bajo una razón social · {report.periodLabel}
          </p>
        </div>
        <Link href="/api/dossier/export?format=pdf&download=1" className="btn-secondary text-sm inline-flex items-center gap-2">
          <FileDown size={14} />
          Dossier PDF
        </Link>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Cobrado mes"
          value={formatCurrency(report.totals.collectedMonth)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="Emitido mes"
          value={formatCurrency(report.totals.emittedMonth)}
          icon={Wallet}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <MetricCard
          label="Cobrado año"
          value={formatCurrency(report.totals.collectedYear)}
          icon={Tag}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
        <MetricCard
          label="Pendiente cobro"
          value={formatCurrency(report.totals.pending)}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose por marca comercial</CardTitle>
        </CardHeader>
        <CardContent>
          {report.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay facturas con marca asignada. Las nuevas facturas heredan la marca activa del selector lateral.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-semibold">Marca</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Cobrado mes</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Emitido mes</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Año cobrado</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Pendiente</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Facturas</th>
                    <th className="pb-3 font-semibold w-40">Participación</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={row.brandId ?? "unassigned"} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.brandColor }}
                          />
                          <div>
                            <p className="font-medium">{row.name}</p>
                            {row.type && (
                              <p className="text-[11px] text-muted-foreground">
                                {BRAND_TYPE_LABELS[row.type as keyof typeof BRAND_TYPE_LABELS] ?? row.type}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums font-medium">
                        {formatCurrency(row.collectedMonth)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(row.emittedMonth)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatCurrency(row.collectedYear)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-amber-700">
                        {formatCurrency(row.pending)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                        {row.invoiceCount}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.round((row.collectedMonth / maxShare) * 100)}%`,
                                backgroundColor: row.brandColor,
                              }}
                            />
                          </div>
                          <span className="text-xs tabular-nums w-8 text-right">{row.sharePct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="pt-4 pr-4">Total</td>
                    <td className="pt-4 pr-4 text-right tabular-nums">{formatCurrency(report.totals.collectedMonth)}</td>
                    <td className="pt-4 pr-4 text-right tabular-nums">{formatCurrency(report.totals.emittedMonth)}</td>
                    <td className="pt-4 pr-4 text-right tabular-nums">{formatCurrency(report.totals.collectedYear)}</td>
                    <td className="pt-4 pr-4 text-right tabular-nums">{formatCurrency(report.totals.pending)}</td>
                    <td className="pt-4 pr-4" colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-4">
        Los impuestos (303, 200, 347) se declaran a nivel de razón social.{" "}
        <Link href="/dashboard/finance/taxes" className="text-brand-600 underline">
          Tax Intelligence
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/finance/dossier" className="text-brand-600 underline">
          Dossier ejecutivo
        </Link>
      </p>
    </div>
  )
}
