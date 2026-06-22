import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { getLegalDisplayName } from "@/lib/brands/catalog"

export const BRAND_COOKIE = "rdpr_brand_id"

export type BrandOption = {
  id: string
  name: string
  slug: string
  type: string
  tagline: string | null
  brandColor: string
  parentId: string | null
}

export async function getCompanyBrands(companyId: string): Promise<BrandOption[]> {
  return prisma.brand.findMany({
    where: { companyId, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      tagline: true,
      brandColor: true,
      parentId: true,
    },
  })
}

export async function getActiveBrandId(companyId?: string): Promise<string | null> {
  const cid = companyId ?? (await getActiveCompanyId())
  if (!cid) return null

  const brands = await getCompanyBrands(cid)
  if (!brands.length) return null

  const preferred = cookies().get(BRAND_COOKIE)?.value
  if (preferred && brands.some((b) => b.id === preferred)) {
    return preferred
  }

  const main = brands.find((b) => b.type === "MAIN")
  return main?.id ?? brands[0].id
}

export async function getActiveBrandContext() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return null

  const [company, brands, activeBrandId] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, legalName: true, taxId: true, brandColor: true },
    }),
    getCompanyBrands(companyId),
    getActiveBrandId(companyId),
  ])

  if (!company) return null

  const activeBrand = brands.find((b) => b.id === activeBrandId) ?? brands[0] ?? null

  return {
    companyId,
    legalName: getLegalDisplayName(company),
    company,
    brands,
    activeBrandId: activeBrand?.id ?? null,
    activeBrand,
  }
}

export async function userBrandBelongsToCompany(
  brandId: string,
  companyId: string
): Promise<boolean> {
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, companyId, active: true },
  })
  return !!brand
}
