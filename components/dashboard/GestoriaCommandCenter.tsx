import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { GestoriaCommandCenter } from "@/lib/gestoria/get-command-center-stats"
import { MetricCard } from "@/components/ui/metric-card"
import { Users, ListTodo, AlertTriangle, FileUp, ArrowRight } from "lucide-react"
import { ONBOARDING_STATUS_LABELS } from "@/lib/crm/labels"

const HEALTH_COLORS = {
  ok: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
}

const HEALTH_LABELS = {
  ok: "Al día",
  warning: "Atención",
  critical: "Urgente",
}

export function GestoriaCommandCenter({ data }: { data: GestoriaCommandCenter }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Centro de mando gestoría</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Vista operativa de todos los expedientes de clientes activos
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Clientes activos"
          value={data.activeClients}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
        />
        <MetricCard
          label="Tareas pendientes"
          value={data.pendingTasks}
          icon={ListTodo}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="Incidencias abiertas"
          value={data.openIncidents}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <MetricCard
          label="Docs portal (30d)"
          value={data.portalDocumentsPending}
          icon={FileUp}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      {data.alerts.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border">
            <h3>Alertas operativas</h3>
          </div>
          <div className="divide-y divide-surface-border">
            {data.alerts.map((a) => (
              <Link
                key={a.id}
                href={a.href ?? "#"}
                className="flex px-5 py-3 hover:bg-surface-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-text-muted">{a.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.upcomingDeadlines.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border flex justify-between items-center">
            <h3>Vencimientos fiscales esta semana</h3>
          </div>
          <div className="divide-y divide-surface-border">
            {data.upcomingDeadlines.map((d, i) => (
              <Link
                key={i}
                href={`/dashboard/crm/${d.customerId}?tab=fiscal`}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{d.customerName}</p>
                  <p className="text-xs text-text-muted">{d.label}</p>
                </div>
                <span className="text-xs font-mono text-amber-700">{formatDate(d.dueDate)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h3>Estado de expedientes</h3>
          <Link href="/dashboard/crm" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Ver CRM <ArrowRight size={12} />
          </Link>
        </div>
        {data.expedientes.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-muted">No hay clientes activos (pipeline: Cliente ganado)</p>
            <Link href="/dashboard/crm/new" className="btn-primary inline-flex mt-3 text-xs">
              Añadir cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-left text-xs text-text-muted">
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="px-4 py-2.5 font-medium">Onboarding</th>
                  <th className="px-4 py-2.5 font-medium">Tareas</th>
                  <th className="px-4 py-2.5 font-medium">Incidencias</th>
                  <th className="px-4 py-2.5 font-medium">Próximo vencimiento</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {data.expedientes.map((e) => (
                  <tr key={e.customerId} className="hover:bg-surface-muted/50">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/crm/${e.customerId}`} className="font-medium hover:text-brand-600">
                        {e.customerName}
                      </Link>
                      {e.taxId && <p className="text-xs text-text-muted font-mono">{e.taxId}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {ONBOARDING_STATUS_LABELS[e.onboardingStatus] ?? e.onboardingStatus}
                    </td>
                    <td className="px-4 py-3">{e.openTasks}</td>
                    <td className="px-4 py-3">{e.openIncidents}</td>
                    <td className="px-4 py-3 text-xs">
                      {e.nextDeadline ? (
                        <>
                          <span className="block">{e.nextDeadline.label}</span>
                          <span className="text-text-muted">{formatDate(e.nextDeadline.dueDate)}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${HEALTH_COLORS[e.health]}`}>
                        {HEALTH_LABELS[e.health]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
