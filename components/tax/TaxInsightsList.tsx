import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import type { TaxInsight } from "@/lib/tax/insights"

const ICONS = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  danger: XCircle,
}

const STYLES = {
  warning: "border-amber-200 bg-amber-50/50 text-amber-900",
  info: "border-blue-200 bg-blue-50/50 text-blue-900",
  success: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
  danger: "border-red-200 bg-red-50/50 text-red-900",
}

export function TaxInsightsList({ insights }: { insights: TaxInsight[] }) {
  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const Icon = ICONS[insight.type]
        return (
          <Card key={insight.id} className={STYLES[insight.type]}>
            <CardContent className="py-4 flex gap-3">
              <Icon size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="text-xs mt-1 opacity-90">{insight.message}</p>
                {insight.actionHref && (
                  <Link
                    href={insight.actionHref}
                    className="inline-block text-xs font-semibold mt-2 underline underline-offset-2"
                  >
                    {insight.actionLabel ?? "Ver más"}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
