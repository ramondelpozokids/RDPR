import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyContext } from "@/lib/company/context"
import SettingsClient from "./SettingsClient"

import { getCompanyBrands } from "@/lib/brands/context"

export default async function SettingsPage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) return <p className="text-text-secondary">Sin empresa asociada.</p>

  const membership = await prisma.userCompany.findUnique({
    where: { userId_companyId: { userId: ctx.userId, companyId: ctx.companyId } },
  })
  if (!membership) return <p className="text-text-secondary">Sin acceso.</p>

  const [users, brands] = await Promise.all([
    prisma.userCompany.findMany({
      where:   { companyId: ctx.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getCompanyBrands(ctx.companyId),
  ])

  return (
    <SettingsClient
      company={ctx.company}
      organization={ctx.organization}
      currentUserId={ctx.userId}
      currentRole={membership.role}
      brands={brands}
      users={users.map((u) => ({
        id:    u.userId,
        name:  u.user.name,
        email: u.user.email,
        role:  u.role,
      }))}
    />
  )
}
