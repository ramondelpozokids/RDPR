import { redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/lib/auth/config"
import { getActivePortalContext, isPortalOnlyUser } from "@/lib/portal/context"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ctx = await getActivePortalContext()
  if (!ctx) {
    if (await isPortalOnlyUser(session.user.id)) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="card text-center max-w-md">
            <p className="text-text-secondary text-sm">No tiene acceso al portal activo.</p>
          </div>
        </div>
      )
    }
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="bg-white border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Portal cliente</p>
            <p className="text-xs text-text-muted">{ctx.customer.name} · {ctx.company.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portal/documentos" className="text-sm text-text-secondary hover:text-brand-600">
              Documentos
            </Link>
            <Link href="/portal/mensajes" className="text-sm text-text-secondary hover:text-brand-600">
              Mensajes
            </Link>
            <Link href="/portal/impuestos" className="text-sm text-text-secondary hover:text-brand-600">
              Resumen
            </Link>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button type="submit" className="text-sm text-text-muted hover:text-text-primary">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
