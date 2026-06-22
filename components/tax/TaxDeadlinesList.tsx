import { Card, CardContent } from "@/components/ui/card"
import type { TaxDeadline } from "@/lib/tax/deadlines"
import Link from "next/link"
import { CalendarClock } from "lucide-react"

export function TaxDeadlinesList({ deadlines }: { deadlines: TaxDeadline[] }) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          No hay vencimientos próximos calculados para tu perfil fiscal.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {deadlines.slice(0, 6).map((d) => (
        <Link key={`${d.modelId}-${d.periodLabel}`} href={`/dashboard/finance/taxes/${d.modelId}`}>
          <Card className="hover:border-brand-200 transition-colors">
            <CardContent className="py-3 flex items-center gap-3">
              <CalendarClock size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{d.modelName}</p>
                <p className="text-xs text-muted-foreground">{d.periodLabel}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold">{d.dueDate.toLocaleDateString("es-ES")}</p>
                <p
                  className={`text-[10px] ${
                    d.urgency === "soon" ? "text-amber-600" : d.urgency === "overdue" ? "text-red-600" : "text-muted-foreground"
                  }`}
                >
                  {d.daysUntil <= 0 ? "Vencido" : `${d.daysUntil} días`}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
