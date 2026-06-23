import { getActiveCompanyContext } from "@/lib/company/context"
import { getGestoriaCommandCenter } from "@/lib/gestoria/get-command-center-stats"
import { GestoriaCommandCenter } from "@/components/dashboard/GestoriaCommandCenter"
import Link from "next/link"

export default async function PilotDashboardPage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) {
    return (
      <div className="card text-center py-16">
        <p className="text-sm text-text-secondary">No tienes ninguna empresa asociada.</p>
      </div>
    )
  }

  const data = await getGestoriaCommandCenter(ctx.companyId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Piloto gestoría</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Panel de demostración — clientes, documentos, IA y alertas operativas
          </p>
        </div>
        <Link href="/dashboard" className="text-xs text-brand-600 hover:underline">
          Dashboard ejecutivo
        </Link>
      </div>
      <GestoriaCommandCenter data={data} />
    </div>
  )
}
