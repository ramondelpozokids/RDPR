import { prisma } from "@/lib/prisma/client"
import { getLegalDisplayName, DEFAULT_LEGAL_NAME, RDPR_BRAND_CATALOG } from "@/lib/brands/catalog"
import { getCompanyBrands } from "@/lib/brands/context"
import { getBrandRevenueReport } from "@/lib/brands/revenue"
import { calculateModel303, calculateModel200, calculateModel347 } from "@/lib/tax/calculations"
import { getTaxIntelligenceInsights } from "@/lib/tax/insights"

export type DossierData = {
  generatedAt: Date
  legalName: string
  taxId: string | null
  founder: string
  brands: Awaited<ReturnType<typeof getCompanyBrands>>
  revenue: Awaited<ReturnType<typeof getBrandRevenueReport>>
  tax303: Awaited<ReturnType<typeof calculateModel303>>
  tax200: Awaited<ReturnType<typeof calculateModel200>>
  tax347: Awaited<ReturnType<typeof calculateModel347>>
  insights: Awaited<ReturnType<typeof getTaxIntelligenceInsights>>
  catalogProducts: typeof RDPR_BRAND_CATALOG
}

export async function buildDossierData(companyId: string): Promise<DossierData> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { legalName: true, name: true, taxId: true },
  })

  const [brands, revenue, tax303, tax200, tax347, insights] = await Promise.all([
    getCompanyBrands(companyId),
    getBrandRevenueReport(companyId),
    calculateModel303(companyId, "current"),
    calculateModel200(companyId),
    calculateModel347(companyId),
    getTaxIntelligenceInsights(companyId),
  ])

  return {
    generatedAt: new Date(),
    legalName: company ? getLegalDisplayName(company) : DEFAULT_LEGAL_NAME,
    taxId: company?.taxId ?? null,
    founder: "Ramón del Pozo Rott",
    brands,
    revenue,
    tax303,
    tax200,
    tax347,
    insights,
    catalogProducts: RDPR_BRAND_CATALOG,
  }
}
