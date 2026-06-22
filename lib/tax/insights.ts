import { prisma } from "@/lib/prisma/client"
import { getTaxCompanyProfile, calculateModel303, calculateModel347 } from "@/lib/tax/calculations"
import { getUpcomingDeadlines } from "@/lib/tax/deadlines"
import { getActiveV1ModelsForEntity } from "@/lib/tax/models-registry"

export type TaxInsight = {
  id: string
  type: "warning" | "info" | "danger" | "success"
  title: string
  message: string
  actionHref?: string
  actionLabel?: string
}

export async function getTaxIntelligenceInsights(companyId: string): Promise<TaxInsight[]> {
  const profile = await getTaxCompanyProfile(companyId)
  if (!profile) return []

  const insights: TaxInsight[] = []
  const deadlines = getUpcomingDeadlines(profile.taxEntityType)

  for (const d of deadlines.filter((x) => x.urgency === "soon" || x.urgency === "overdue").slice(0, 2)) {
    insights.push({
      id: `deadline-${d.modelId}`,
      type: d.urgency === "overdue" ? "danger" : "warning",
      title: `Vencimiento ${d.modelName}`,
      message: `Plazo orientativo: ${d.dueDate.toLocaleDateString("es-ES")} (${d.periodLabel}). Quedan ${d.daysUntil} días.`,
      actionHref: `/dashboard/finance/taxes/${d.modelId}`,
      actionLabel: "Ver modelo",
    })
  }

  if (!profile.taxId) {
    insights.push({
      id: "missing-tax-id",
      type: "danger",
      title: "NIF/CIF no configurado",
      message: "Configura el NIF/CIF de la empresa para generar modelos fiscales y eFactura válidos.",
      actionHref: "/dashboard/settings",
      actionLabel: "Ajustes",
    })
  }

  const [m303, customersWithoutNif, expensesWithoutVendorNif] = await Promise.all([
    calculateModel303(companyId, "current"),
    prisma.customer.count({
      where: { companyId, taxId: null, invoices: { some: {} } },
    }),
    prisma.expense.count({
      where: { companyId, vendorTaxId: null, status: { not: "CANCELLED" } },
    }),
  ])

  if (m303.ivaNeto > 0 && m303.invoiceCount === 0) {
    insights.push({
      id: "iva-no-invoices",
      type: "warning",
      title: "IVA sin facturas del periodo",
      message: "Hay movimiento en cuentas 477/472 pero no hay facturas emitidas en el trimestre. Revisa el libro diario.",
      actionHref: "/dashboard/finance/journal",
      actionLabel: "Libro diario",
    })
  }

  if (customersWithoutNif > 0) {
    insights.push({
      id: "customers-nif",
      type: "warning",
      title: `${customersWithoutNif} cliente(s) sin NIF/CIF`,
      message: "Necesario para eFactura B2B, modelo 347 y retenciones.",
      actionHref: "/dashboard/crm",
      actionLabel: "CRM",
    })
  }

  if (expensesWithoutVendorNif > 0) {
    insights.push({
      id: "vendor-nif",
      type: "info",
      title: `${expensesWithoutVendorNif} gasto(s) sin NIF proveedor`,
      message: "Añade el NIF del proveedor en gastos para completar el modelo 347.",
      actionHref: "/dashboard/finance/expenses",
      actionLabel: "Gastos",
    })
  }

  const m347 = await calculateModel347(companyId)
  if (m347.parties.some((p) => !p.taxId)) {
    insights.push({
      id: "347-missing-nif",
      type: "warning",
      title: "Modelo 347 incompleto",
      message: "Hay terceros por encima del umbral sin NIF/CIF identificado.",
      actionHref: "/dashboard/finance/taxes/347",
      actionLabel: "Ver 347",
    })
  }

  const applicable = getActiveV1ModelsForEntity(profile.taxEntityType)
  if (profile.taxEntityType === "AUTONOMO" && !profile.irpfRegime) {
    insights.push({
      id: "irpf-regime",
      type: "info",
      title: "Régimen IRPF no definido",
      message: "Indica estimación directa o módulos en ajustes fiscales para personalizar modelos 130/131.",
      actionHref: "/dashboard/settings",
      actionLabel: "Perfil fiscal",
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: "ok",
      type: "success",
      title: "Sin alertas críticas",
      message: `${applicable.length} modelos V1 activos para tu perfil (${profile.taxEntityType}).`,
      actionHref: "/dashboard/finance/taxes",
      actionLabel: "Tax Intelligence",
    })
  }

  return insights
}
