import { getActiveCompanyId } from "@/lib/company/context"
import { getEFacturaStats, getEFacturaComplianceIssues } from "@/lib/efactura/stats"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EFactura_CAPABILITIES, EFactura_ROADMAP, RDPR_EFACTURA_TAGLINE, FINANCE_MODULE_CARD } from "@/lib/finance/structure"
import { FileCheck2, Shield, Send, Hash, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ISSUE_VARIANT: Record<string, "warning" | "success" | "destructive" | "muted"> = {
  warning: "warning",
  danger: "destructive",
  info: "muted",
}

export default async function EFacturaPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const [stats, issues] = await Promise.all([
    getEFacturaStats(companyId),
    getEFacturaComplianceIssues(companyId),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>RDPR eFactura</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{RDPR_EFACTURA_TAGLINE}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/invoicing/new">
            Emitir factura
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Cumplimiento" value={`${stats.complianceScore}/100`} icon={Shield} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <MetricCard label="Facturas emitidas" value={String(stats.total)} icon={FileCheck2} iconColor="text-primary" iconBg="bg-accent" />
        <MetricCard label="Con huella" value={String(stats.withHash)} icon={Hash} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <MetricCard label="Envío electrónico" value={String(stats.sent)} icon={Send} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de cumplimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="flex gap-3 p-3 rounded-lg border border-border">
                {issue.type === "danger" ? (
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{issue.title}</p>
                    <Badge variant={ISSUE_VARIANT[issue.type]}>{issue.type === "danger" ? "Crítico" : issue.type === "warning" ? "Atención" : "Info"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                  {issue.href && (
                    <Link href={issue.href} className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
                      Resolver →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marco legal España</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              RDPR eFactura cubre la <strong className="text-foreground">facturación electrónica B2B</strong> (Ley Crea y Crece),
              exportación <strong className="text-foreground">Facturae 3.2</strong> y <strong className="text-foreground">UBL</strong>,
              huella orientativa <strong className="text-foreground">Verifactu / Ley Antifraude</strong>, e integración contable automática.
            </p>
            <p>
              Forma parte de <strong className="text-foreground">{FINANCE_MODULE_CARD.title}</strong> junto con contabilidad, banca, impuestos e IA financiera — no es un producto aislado.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacidades activas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {EFactura_CAPABILITIES.map((cap) => (
                <li key={cap} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  {cap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {EFactura_ROADMAP.map(({ label }) => (
                <li key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant="muted">Próximamente</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
