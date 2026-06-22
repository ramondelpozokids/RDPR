// app/dashboard/crm/page.tsx
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatDate, PIPELINE_LABELS } from "@/lib/utils"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { PipelineBoard } from "@/components/crm/PipelineBoard"
import { CRMPageClient } from "@/components/crm/CRMPageClient"
import { MetricCard } from "@/components/ui/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, TrendingUp, TrendingDown, Clock } from "lucide-react"

const STAGE_BADGE: Record<string, "info" | "warning" | "success" | "muted"> = {
  NEW_CONTACT: "info",
  QUOTE_SENT: "warning",
  CLIENT_WON: "success",
  CLIENT_LOST: "muted",
}

export default async function CRMPage() {
  const companyId = await getActiveCompanyId()

  const customers = companyId
    ? await prisma.customer.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { projects: true, invoices: true } } },
      })
    : []

  const ganados = customers.filter((c) => c.pipelineStage === "CLIENT_WON").length
  const perdidos = customers.filter((c) => c.pipelineStage === "CLIENT_LOST").length
  const enCurso = customers.filter((c) => c.pipelineStage === "QUOTE_SENT").length

  const pipelineData = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    pipelineStage: c.pipelineStage,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
  }))

  const pipelineView = <PipelineBoard customers={pipelineData} />

  const listView =
    customers.length === 0 ? (
      <Card className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
          <UserPlus size={20} className="text-primary" />
        </div>
        <p className="font-medium text-foreground mb-1">Sin clientes todavía</p>
        <p className="text-sm text-muted-foreground mb-4">Añade tu primer contacto al CRM</p>
        <Button asChild>
          <Link href="/dashboard/crm/new">Añadir primer cliente</Link>
        </Button>
      </Card>
    ) : (
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Nombre</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Email</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden md:table-cell">Teléfono</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Estado</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden lg:table-cell">Proyectos</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden lg:table-cell">Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/crm/${c.id}`}
                    className="font-medium text-foreground group-hover:text-primary transition-colors"
                  >
                    {c.name}
                  </Link>
                  {c.taxId && <p className="text-xs text-muted-foreground mt-0.5">{c.taxId}</p>}
                </td>
                <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{c.email ?? "—"}</td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{c.phone ?? "—"}</td>
                <td className="px-5 py-3">
                  <Badge variant={STAGE_BADGE[c.pipelineStage]}>
                    {PIPELINE_LABELS[c.pipelineStage]}
                  </Badge>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell text-muted-foreground">
                  {c._count.projects} proy · {c._count.invoices} fact
                </td>
                <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                  {formatDate(c.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{customers.length} contactos</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/crm/new">
            <UserPlus size={15} />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {customers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total" value={customers.length} icon={Users} iconColor="text-foreground" iconBg="bg-muted" />
          <MetricCard label="Presupuestados" value={enCurso} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <MetricCard label="Ganados" value={ganados} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <MetricCard label="Perdidos" value={perdidos} icon={TrendingDown} iconColor="text-muted-foreground" iconBg="bg-muted" />
        </div>
      )}

      {customers.length === 0 ? (
        listView
      ) : (
        <CRMPageClient pipeline={pipelineView} list={listView} />
      )}
    </div>
  )
}
