// lib/company/context.ts
import { cookies } from "next/headers"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma/client"

export const COMPANY_COOKIE = "rdpr_company_id"

export type CompanyOption = {
  id: string
  name: string
  slug: string | null
  brandColor: string | null
  role: string
  organizationName: string | null
}

export async function getUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getUserMemberships(userId: string) {
  return prisma.userCompany.findMany({
    where: { userId },
    include: {
      company: { include: { organization: true } },
    },
    orderBy: { company: { name: "asc" } },
  })
}

export async function getActiveCompanyId(userId?: string): Promise<string | null> {
  const uid = userId ?? (await getUserId())
  if (!uid) return null

  const memberships = await getUserMemberships(uid)
  if (!memberships.length) return null

  const preferred = cookies().get(COMPANY_COOKIE)?.value
  if (preferred && memberships.some((m) => m.companyId === preferred)) {
    return preferred
  }

  return memberships[0].companyId
}

/** API routes — returns active company id or null */
export async function requireCompanyId(): Promise<string | null> {
  return getActiveCompanyId()
}

export async function getActiveCompanyContext() {
  const userId = await getUserId()
  if (!userId) return null

  const memberships = await getUserMemberships(userId)
  if (!memberships.length) return null

  const companyId = await getActiveCompanyId(userId)
  const active = memberships.find((m) => m.companyId === companyId)
  if (!active) return null

  const companies: CompanyOption[] = memberships.map((m) => ({
    id: m.companyId,
    name: m.company.name,
    slug: m.company.slug,
    brandColor: m.company.brandColor,
    role: m.role,
    organizationName: m.company.organization?.name ?? null,
  }))

  return {
    userId,
    companyId: active.companyId,
    company: active.company,
    organization: active.company.organization,
    companies,
  }
}

export async function userHasCompanyAccess(
  userId: string,
  companyId: string
): Promise<boolean> {
  const uc = await prisma.userCompany.findUnique({
    where: { userId_companyId: { userId, companyId } },
  })
  return !!uc
}
