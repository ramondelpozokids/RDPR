import { cookies } from "next/headers"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma/client"

export const PORTAL_CUSTOMER_COOKIE = "rdpr_portal_customer_id"

export type PortalContext = {
  userId: string
  companyId: string
  customerId: string
  customer: { id: string; name: string; email: string | null }
  company: { id: string; name: string }
}

export async function getPortalAccesses(userId: string) {
  return prisma.clientPortalAccess.findMany({
    where: { userId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function isPortalOnlyUser(userId: string): Promise<boolean> {
  const [memberships, portal] = await Promise.all([
    prisma.userCompany.count({ where: { userId } }),
    prisma.clientPortalAccess.count({ where: { userId } }),
  ])
  return portal > 0 && memberships === 0
}

export async function hasPortalAccess(userId: string): Promise<boolean> {
  const count = await prisma.clientPortalAccess.count({ where: { userId } })
  return count > 0
}

export async function getActivePortalContext(): Promise<PortalContext | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const accesses = await getPortalAccesses(userId)
  if (!accesses.length) return null

  const preferred = cookies().get(PORTAL_CUSTOMER_COOKIE)?.value
  const active =
    accesses.find((a) => preferred && a.customerId === preferred) ?? accesses[0]

  return {
    userId,
    companyId: active.companyId,
    customerId: active.customerId,
    customer: active.customer,
    company: active.company,
  }
}

export async function requirePortalContext(): Promise<PortalContext | null> {
  return getActivePortalContext()
}
