import { prisma } from "@/lib/prisma/client"
import { RDPR_BRAND_CATALOG, DEFAULT_LEGAL_NAME } from "@/lib/brands/catalog"

/** Crea o actualiza el catálogo de marcas comerciales de la razón social. */
export async function ensureCompanyBrands(companyId: string) {
  const idBySlug = new Map<string, string>()

  for (const entry of RDPR_BRAND_CATALOG) {
    const brand = await prisma.brand.upsert({
      where: { companyId_slug: { companyId, slug: entry.slug } },
      update: {
        name: entry.name,
        type: entry.type,
        tagline: entry.tagline,
        brandColor: entry.brandColor,
        sortOrder: entry.sortOrder,
        active: true,
      },
      create: {
        companyId,
        slug: entry.slug,
        name: entry.name,
        type: entry.type,
        tagline: entry.tagline,
        brandColor: entry.brandColor,
        sortOrder: entry.sortOrder,
      },
    })
    idBySlug.set(entry.slug, brand.id)
  }

  for (const entry of RDPR_BRAND_CATALOG) {
    if (!entry.parentSlug) continue
    const parentId = idBySlug.get(entry.parentSlug)
    const brandId = idBySlug.get(entry.slug)
    if (parentId && brandId) {
      await prisma.brand.update({
        where: { id: brandId },
        data: { parentId },
      })
    }
  }

  return prisma.brand.findMany({
    where: { companyId, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
}

/** Aplica razón social RDPR Digital S.L. si aún no está definida. */
export async function ensureRdprLegalEntity(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) return null
  if (company.legalName) return company

  return prisma.company.update({
    where: { id: companyId },
    data: {
      legalName: DEFAULT_LEGAL_NAME,
      name: DEFAULT_LEGAL_NAME,
      taxEntityType: company.taxEntityType ?? "SL",
      vatFilingPeriod: company.vatFilingPeriod ?? "QUARTERLY",
      country: company.country || "ES",
      currency: company.currency || "EUR",
    },
  })
}
