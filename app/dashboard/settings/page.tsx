import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyContext } from "@/lib/company/context"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) return <p className="text-text-secondary">Sin empresa asociada.</p>

  const membership = await prisma.userCompany.findUnique({
    where: { userId_companyId: { userId: ctx.userId, companyId: ctx.companyId } },
  })
  if (!membership) return <p className="text-text-secondary">Sin acceso.</p>

  const users = await prisma.userCompany.findMany({
    where:   { companyId: ctx.companyId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  })

  return (
    <SettingsClient
      company={ctx.company}
      organization={ctx.organization}
      currentUserId={ctx.userId}
      currentRole={membership.role}
      users={users.map((u) => ({
        id:    u.userId,
        name:  u.user.name,
        email: u.user.email,
        role:  u.role,
      }))}
    />
  )
}
