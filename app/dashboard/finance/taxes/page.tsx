import { getActiveCompanyId } from "@/lib/company/context"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTaxDashboardSummary } from "@/lib/tax/calculations"
import { getTaxIntelligenceInsights } from "@/lib/tax/insights"
import { getUpcomingDeadlines } from "@/lib/tax/deadlines"
import {
  TAX_MODELS,
  TAX_MODEL_CATEGORIES,
  getActiveV1ModelsForEntity,
  RDPR_TAX_INTELLIGENCE_TAGLINE,
  TAX_INTELLIGENCE_ROADMAP,
} from "@/lib/tax/models-registry"
import { TaxModelCard } from "@/components/tax/TaxModelCard"
import { TaxInsightsList } from "@/components/tax/TaxInsightsList"
import { TaxDeadlinesList } from "@/components/tax/TaxDeadlinesList"
import { formatCurrency } from "@/lib/utils"
import { Receipt, Wallet, Users, Building2, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

const ENTITY_LABELS: Record<string, string> = {
  AUTONOMO: "Autónomo",
  SL: "Sociedad Limitada",
  SA: "Sociedad Anónima",
  OTHER: "Otra entidad",
}

export default async function TaxIntelligencePage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const summary = await getTaxDashboardSummary(companyId)
  if (!summary) return <p className="text-muted-foreground text-sm">Empresa no encontrada</p>

  const { profile, period, m303, m130, m111, m347 } = summary
  const [insights, deadlines] = await Promise.all([
    getTaxIntelligenceInsights(companyId),
    Promise.resolve(getUpcomingDeadlines(profile.taxEntityType)),
  ])

  const v1Models = getActiveV1ModelsForEntity(profile.taxEntityType)
  const amountByModel: Record<string, string> = {
    "303": formatCurrency(m303.ivaNeto),
    "130": m130 ? formatCurrency(m130.pagoFraccionado) : "—",
    "111": formatCurrency(m111.totalRetenciones),
    "347": formatCurrency(m347.totalDeclared),
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>RDPR Tax Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{RDPR_TAX_INTELLIGENCE_TAGLINE}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {ENTITY_LABELS[profile.taxEntityType] ?? profile.taxEntityType}
        </Badge>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="IVA neto trimestre"
          value={formatCurrency(m303.ivaNeto)}
          icon={Receipt}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        {m130 && (
          <MetricCard
            label="IRPF fraccionado (130)"
            value={formatCurrency(m130.pagoFraccionado)}
            icon={Wallet}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        )}
        <MetricCard
          label="Retenciones (111)"
          value={formatCurrency(m111.totalRetenciones)}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="347 declarable"
          value={String(m347.parties.length)}
          icon={Building2}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles size={16} /> IA Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaxInsightsList insights={insights} />
            </CardContent>
          </Card>

          <div>
            <h2 className="text-sm font-semibold mb-3">Modelos V1 — {period.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {v1Models.map((model) => (
                <TaxModelCard
                  key={model.id}
                  model={model}
                  amount={amountByModel[model.id]}
                  periodLabel={model.frequency === "anual" ? `Ejercicio ${period.year}` : period.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vencimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxDeadlinesList deadlines={deadlines} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={16} /> Perfil fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Entidad:</span>{" "}
                {ENTITY_LABELS[profile.taxEntityType]}
              </p>
              <p>
                <span className="text-muted-foreground">IVA:</span>{" "}
                {profile.vatFilingPeriod === "MONTHLY" ? "Mensual" : "Trimestral"}
              </p>
              <p>
                <span className="text-muted-foreground">NIF/CIF:</span>{" "}
                {profile.taxId ?? "Sin configurar"}
              </p>
              <Link href="/dashboard/settings" className="text-xs font-semibold text-brand-600 underline">
                Editar perfil fiscal
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {(Object.keys(TAX_MODEL_CATEGORIES) as Array<keyof typeof TAX_MODEL_CATEGORIES>).map((cat) => {
        const models = TAX_MODELS.filter((m) => m.category === cat)
        if (models.length === 0) return null
        return (
          <div key={cat} className="mb-8">
            <h2 className="text-sm font-semibold mb-1">{TAX_MODEL_CATEGORIES[cat].label}</h2>
            <p className="text-xs text-muted-foreground mb-3">{TAX_MODEL_CATEGORIES[cat].description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {models.map((model) => (
                <TaxModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roadmap fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {TAX_INTELLIGENCE_ROADMAP.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Integración Verifactu y eFactura obligatoria disponible en{" "}
            <Link href="/dashboard/finance/efactura" className="text-brand-600 underline">
              RDPR eFactura
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
