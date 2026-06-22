import { notFound } from "next/navigation"
import Link from "next/link"
import { getActiveCompanyId } from "@/lib/company/context"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateTaxModel } from "@/lib/tax/calculations"
import { getTaxModel } from "@/lib/tax/models-registry"
import { TaxExportButton } from "@/components/tax/TaxExportButton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Calculator, Receipt, Users, Building2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  params: { modelId: string }
  searchParams: { period?: string }
}

export default async function TaxModelPage({ params, searchParams }: Props) {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const model = getTaxModel(params.modelId)
  if (!model) notFound()

  if (!model.v1) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>{model.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{model.description}</p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/finance/taxes">
              <ArrowLeft size={14} />
              Tax Intelligence
            </Link>
          </Button>
        </div>
        <FinanceNav />
        <Card>
          <CardContent className="py-8 text-center">
            <Badge variant="muted" className="mb-3">Próximamente</Badge>
            <p className="text-sm text-muted-foreground">
              Este modelo estará disponible en una próxima versión de RDPR Tax Intelligence.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const result = await calculateTaxModel(companyId, params.modelId, searchParams.period)
  if (!result) notFound()

  const Icon = model.icon
  const disclaimer =
    "disclaimer" in result.data
      ? result.data.disclaimer
      : "Estimación orientativa. No sustituye asesoramiento fiscal ni presentación AEAT."

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{model.code}</Badge>
            <Badge variant="success">V1</Badge>
          </div>
          <h1>{model.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{model.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/finance/taxes">
              <ArrowLeft size={14} />
              Volver
            </Link>
          </Button>
          <TaxExportButton modelId={params.modelId} period={searchParams.period} />
        </div>
      </div>

      <FinanceNav />

      <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-amber-900 text-xs mb-6">
        {disclaimer}
      </div>

      {result.modelId === "303" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="IVA repercutido" value={formatCurrency(result.data.ivaRepercutido)} icon={Receipt} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="IVA soportado" value={formatCurrency(result.data.ivaSoportado)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <MetricCard label="IVA neto" value={formatCurrency(result.data.ivaNeto)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
            <MetricCard label="Base imponible" value={formatCurrency(result.data.baseImponible)} icon={Building2} iconColor="text-amber-600" iconBg="bg-amber-50" />
          </div>
          <CasillasCard casillas={result.data.casillas} period={result.data.period.label} />
        </>
      )}

      {result.modelId === "390" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Total repercutido" value={formatCurrency(result.data.totalRepercutido)} icon={Receipt} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Total soportado" value={formatCurrency(result.data.totalSoportado)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <MetricCard label="Resultado anual" value={formatCurrency(result.data.totalNeto)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Trimestre</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Repercutido</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Soportado</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.trimestres.map((t) => (
                  <tr key={t.quarter}>
                    <td className="px-5 py-3">T{t.quarter}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">{formatCurrency(t.ivaRepercutido)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs">{formatCurrency(t.ivaSoportado)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold">{formatCurrency(t.ivaNeto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {result.modelId === "130" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Ingresos" value={formatCurrency(result.data.ingresos)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <MetricCard label="Gastos" value={formatCurrency(result.data.gastos)} icon={Wallet} iconColor="text-red-600" iconBg="bg-red-50" />
          <MetricCard label="Rendimiento neto" value={formatCurrency(result.data.rendimientoNeto)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          <MetricCard label="Pago fraccionado" value={formatCurrency(result.data.pagoFraccionado)} icon={Wallet} iconColor="text-amber-600" iconBg="bg-amber-50" />
        </div>
      )}

      {result.modelId === "131" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard label="Ingresos facturados" value={formatCurrency(result.data.ingresos)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <MetricCard label="Rendimiento neto est." value={formatCurrency(result.data.rendimientoNeto)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          <MetricCard label="Pago fraccionado" value={formatCurrency(result.data.pagoFraccionado)} icon={Wallet} iconColor="text-amber-600" iconBg="bg-amber-50" />
        </div>
      )}

      {result.modelId === "111" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label="Base total" value={formatCurrency(result.data.totalBase)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Retenciones" value={formatCurrency(result.data.totalRetenciones)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <LinesTable
            headers={["Perceptor", "NIF", "Base", "Tipo %", "Retención", "Factura", "Fecha"]}
            rows={result.data.lines.map((l) => [
              l.recipientName,
              l.recipientTaxId ?? "—",
              formatCurrency(l.baseAmount),
              `${l.withholdingRate.toFixed(1)}%`,
              formatCurrency(l.withholdingAmount),
              l.invoiceNumber,
              formatDate(l.issueDate),
            ])}
            empty="Sin retenciones en el periodo. Añade % IRPF en facturas a profesionales."
          />
        </>
      )}

      {result.modelId === "115" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label="Base alquileres" value={formatCurrency(result.data.totalBase)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Retenciones" value={formatCurrency(result.data.totalRetenciones)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <LinesTable
            headers={["Arrendador", "NIF", "Base", "Tipo %", "Retención", "Concepto", "Fecha"]}
            rows={result.data.lines.map((l) => [
              l.landlordName,
              l.landlordTaxId ?? "—",
              formatCurrency(l.baseAmount),
              `${l.withholdingRate.toFixed(1)}%`,
              formatCurrency(l.withholdingAmount),
              l.description,
              formatDate(l.issueDate),
            ])}
            empty="Sin retenciones de alquiler. Registra gastos con categoría Alquileres."
          />
        </>
      )}

      {result.modelId === "180" && (
        <>
          <div className="mb-6 max-w-sm">
            <MetricCard label="Total retenciones anuales" value={formatCurrency(result.data.totalRetenciones)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <LinesTable
            headers={["Arrendador", "NIF", "Base", "Retenciones", "Pagos"]}
            rows={result.data.landlords.map((l) => [
              l.name,
              l.taxId ?? "—",
              formatCurrency(l.totalBase),
              formatCurrency(l.totalRetenciones),
              String(l.expenseCount),
            ])}
            empty="Sin datos de alquileres en el ejercicio."
          />
        </>
      )}

      {result.modelId === "190" && (
        <>
          <div className="mb-6 max-w-sm">
            <MetricCard label="Total retenciones anuales" value={formatCurrency(result.data.totalRetenciones)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <LinesTable
            headers={["Perceptor", "NIF", "Base", "Retenciones", "Facturas"]}
            rows={result.data.recipients.map((r) => [
              r.name,
              r.taxId ?? "—",
              formatCurrency(r.totalBase),
              formatCurrency(r.totalRetenciones),
              String(r.invoiceCount),
            ])}
            empty="Sin datos de retenciones en el ejercicio."
          />
        </>
      )}

      {result.modelId === "200" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Ingresos" value={formatCurrency(result.data.ingresos)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <MetricCard label="Gastos" value={formatCurrency(result.data.gastos)} icon={Wallet} iconColor="text-red-600" iconBg="bg-red-50" />
          <MetricCard label="Base imponible" value={formatCurrency(result.data.baseImponible)} icon={Building2} iconColor="text-violet-600" iconBg="bg-violet-50" />
          <MetricCard label="Cuota íntegra (25%)" value={formatCurrency(result.data.cuotaIntegra)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
        </div>
      )}

      {result.modelId === "202" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Ingresos" value={formatCurrency(result.data.ingresos)} icon={Receipt} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <MetricCard label="Gastos" value={formatCurrency(result.data.gastos)} icon={Wallet} iconColor="text-red-600" iconBg="bg-red-50" />
            <MetricCard label="Cuota íntegra est." value={formatCurrency(result.data.cuotaIntegraEstimada)} icon={Building2} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Pago fraccionado (18%)" value={formatCurrency(result.data.pagoFraccionado)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Vencimiento orientativo: {result.data.vencimientoReferencia}
          </p>
        </>
      )}

      {result.modelId === "347" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label="Terceros declarables" value={String(result.data.parties.length)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Importe total" value={formatCurrency(result.data.totalDeclared)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Umbral: {formatCurrency(result.data.threshold)} · Ejercicio {result.data.period.year}
          </p>
          <LinesTable
            headers={["Tercero", "NIF", "Tipo", "Importe anual", "Ops."]}
            rows={result.data.parties.map((p) => [
              p.name,
              p.taxId ?? "Sin NIF",
              p.operationType === "A" ? "Ventas" : "Compras",
              formatCurrency(p.totalAmount),
              String(p.operationCount),
            ])}
            empty="Ningún tercero supera el umbral del modelo 347 en este ejercicio."
          />
        </>
      )}

      {result.modelId === "349" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label="Entregas UE (base)" value={formatCurrency(result.data.totalDeliveries)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
            <MetricCard label="Adquisiciones UE (base)" value={formatCurrency(result.data.totalAcquisitions)} icon={Calculator} iconColor="text-primary" iconBg="bg-accent" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Periodo mensual: {result.data.period.label}
          </p>
          <LinesTable
            headers={["Tercero", "NIF-IVA", "País", "Tipo", "Base", "Doc.", "Fecha"]}
            rows={result.data.operations.map((o) => [
              o.partyName,
              o.vatNumber,
              o.countryCode,
              o.operationType === "E" ? "Entrega" : "Adquisición",
              formatCurrency(o.baseAmount),
              o.documentRef,
              formatDate(o.issueDate),
            ])}
            empty="Sin operaciones intracomunitarias detectadas en el mes."
          />
        </>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon size={16} />
            Presentación AEAT
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Exportación CSV orientativa para revisión interna y asesor. La presentación telemática con certificado digital estará disponible en roadmap.</p>
          <p>
            Ver también:{" "}
            <Link href="/dashboard/finance/efactura" className="text-brand-600 underline">
              eFactura / Verifactu
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function CasillasCard({ casillas, period }: { casillas: Record<string, number>; period: string }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="text-sm font-semibold">Casillas orientativas · {period}</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {Object.entries(casillas).map(([key, val]) => (
            <tr key={key}>
              <td className="px-5 py-3 text-muted-foreground">{key}</td>
              <td className="px-5 py-3 text-right font-mono text-xs font-semibold">{formatCurrency(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function LinesTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-5 py-3 ${j >= headers.length - 3 && j > 0 ? "text-right font-mono text-xs" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
