import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { CustomerActivityEvent } from "@/lib/crm/activity-log"

const KIND_LABELS: Record<CustomerActivityEvent["kind"], string> = {
  log: "Sistema",
  document: "Documento",
  task: "Tarea",
  message: "Mensaje",
}

export function CustomerActivityTimeline({ events }: { events: CustomerActivityEvent[] }) {
  if (!events.length) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-text-muted">Sin actividad registrada en este expediente.</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border">
        <h3>Timeline del expediente</h3>
      </div>
      <ul className="divide-y divide-surface-border">
        {events.map((event) => (
          <li key={event.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{event.title}</p>
                {event.description && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{event.description}</p>
                )}
                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
                  {KIND_LABELS[event.kind]}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-text-muted">{formatDate(event.at)}</p>
                {event.href && (
                  <Link href={event.href} className="text-xs text-brand-600 hover:underline">
                    Ver
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
