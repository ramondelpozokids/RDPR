// app/dashboard/layout.tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { getActiveCompanyContext } from "@/lib/company/context"
import { isPortalOnlyUser } from "@/lib/portal/context"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (session.user.id && (await isPortalOnlyUser(session.user.id))) {
    redirect("/portal/documentos")
  }

  const ctx = await getActiveCompanyContext()
  if (!ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card text-center max-w-md">
          <p className="text-text-secondary text-sm">No tienes ninguna empresa asociada.</p>
          <a href="/register" className="btn-primary inline-flex mt-4">Crear empresa</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
