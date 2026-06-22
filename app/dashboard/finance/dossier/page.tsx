import Link from "next/link"
import { getActiveCompanyId } from "@/lib/company/context"
import { buildDossierData } from "@/lib/dossier/build-dossier-data"
import { BRAND_TYPE_LABELS } from "@/lib/brands/catalog"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxInsightsList } from "@/components/tax/TaxInsightsList"
import { formatCurrency } from "@/lib/utils"
import { Building2, FileDown, Printer, Tag, Receipt, TrendingUp } from "lucide-react"

export default async function DossierPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const data = await buildDossierData(companyId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dossier ejecutivo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.legalName} · generado {data.generatedAt.toLocaleDateString("es-ES")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/dossier/export" target="_blank" className="btn-secondary text-sm inline-flex items-center gap-2">
            <Printer size={14} />
            Vista imprimible
          </Link>
          <Link href="/api/dossier/export?format=pdf&download=1" className="btn-primary text-sm inline-flex items-center gap-2">
            <FileDown size={14} />
            Descargar PDF
          </Link>
        </div>
      </div>

      <FinanceNav />

      <Card className="mb-6 border-brand-100 bg-gradient-to-r from-brand-50/50 to-slate-50/50">
        <CardContent className="py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Modelo de negocio</p>
          <p className="text-sm text-muted-foreground max-w-3xl">
            <strong className="text-foreground">{data.legalName}</strong> actúa como razón social única para
            facturación, AEAT e impuestos. Las {data.brands.length} marcas comerciales permiten trazabilidad de
            ingresos y productos sin multiplicar obligaciones fiscales.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Cobrado mes"
          value={formatCurrency(data.revenue.totals.collectedMonth)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="IVA neto trimestre"
          value={formatCurrency(data.tax303.ivaNeto)}
          icon={Receipt}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <MetricCard
          label="IS estimado"
          value={formatCurrency(data.tax200.cuotaIntegra)}
          icon={Building2}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
        <MetricCard
          label="Marcas activas"
          value={String(data.brands.length)}
          icon={Tag}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingresos por marca · {data.revenue.periodLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase">
                      <th className="pb-2 text-left font-semibold">Marca</th>
                      <th className="pb-2 text-right font-semibold">Cobrado</th>
                      <th className="pb-2 text-right font-semibold">Pendiente</th>
                      <th className="pb-2 text-right font-semibold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenue.rows.slice(0, 8).map((r) => (
                      <tr key={r.brandId ?? "x"} className="border-b border-border/50">
                        <td className="py-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: r.brandColor }} />
                          {r.name}
                        </td>
                        <td className="py-2 text-right tabular-nums">{formatCurrency(r.collectedMonth)}</td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(r.pending)}
                        </td>
                        <td className="py-2 text-right tabular-nums">{r.sharePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="/dashboard/finance/brands" className="text-xs font-semibold text-brand-600 underline mt-3 inline-block">
                Ver informe completo por marca
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ecosistema de marcas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.brands.map((b) => (
                  <div key={b.id} className="flex gap-3 p-3 rounded-lg border bg-muted/30">
                    <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: b.brandColor }} />
                    <div>
                      <p className="font-medium text-sm">{b.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {BRAND_TYPE_LABELS[b.type as keyof typeof BRAND_TYPE_LABELS]}
                      </p>
                      {b.tagline && <p className="text-[11px] text-muted-foreground mt-0.5">{b.tagline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alertas fiscales</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxInsightsList insights={data.insights} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Constitución SL</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Denominación:</span> {data.legalName}</p>
              <p><span className="text-muted-foreground">Administrador:</span> {data.founder}</p>
              <p><span className="text-muted-foreground">Capital mínimo:</span> 3.000 €</p>
              <p><span className="text-muted-foreground">NIF/CIF:</span> {data.taxId ?? "Pendiente"}</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-3 space-y-1">
                <li>Registro Mercantil</li>
                <li>Cuenta bancaria empresa</li>
                <li>Registro marcas (OMPI)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendario fiscal</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>303 · IVA trimestral</p>
              <p>390 · Resumen anual IVA</p>
              <p>200 · Impuesto Sociedades (julio)</p>
              <p>347 · Operaciones &gt; 3.005 € (febrero)</p>
              <Link href="/dashboard/finance/taxes" className="text-brand-600 underline font-semibold block mt-2">
                Abrir Tax Intelligence
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{data.tax303.disclaimer}</p>
    </div>
  )
}
