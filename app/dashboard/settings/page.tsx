// app/(dashboard)/settings/page.tsx
import { prisma }  from "@/lib/prisma/client"
import { auth }    from "@/lib/auth/config"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const session = await auth()
  const uc = await prisma.userCompany.findFirst({
    where:   { userId: session!.user!.id as string },
    include: {
      company: true,
      user:    true,
    },
  })

  if (!uc) return <p className="text-text-secondary">Sin empresa asociada.</p>

  const users = await prisma.userCompany.findMany({
    where:   { companyId: uc.companyId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  })

  return (
    <SettingsClient
      company={uc.company}
      currentUserId={uc.userId}
      currentRole={uc.role}
      users={users.map((u) => ({
        id:    u.userId,
        name:  u.user.name,
        email: u.user.email,
        role:  u.role,
      }))}
    />
  )
}
