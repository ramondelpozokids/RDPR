import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AccountingInsight } from "@/lib/accounting/insights"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

const ICONS = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  danger: XCircle,
}

const VARIANTS: Record<AccountingInsight["type"], "warning" | "muted" | "success" | "destructive"> = {
  warning: "warning",
  info: "muted",
  success: "success",
  danger: "destructive",
}

export function AccountingInsightsCard({ insights }: { insights: AccountingInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>IA contable · Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((ins) => {
          const Icon = ICONS[ins.type]
          const inner = (
            <div className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <Icon
                size={18}
                className={
                  ins.type === "danger"
                    ? "text-red-600 shrink-0 mt-0.5"
                    : ins.type === "warning"
                      ? "text-amber-600 shrink-0 mt-0.5"
                      : ins.type === "success"
                        ? "text-emerald-600 shrink-0 mt-0.5"
                        : "text-muted-foreground shrink-0 mt-0.5"
                }
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{ins.title}</p>
                  <Badge variant={VARIANTS[ins.type]}>{ins.type === "danger" ? "Crítico" : ins.type === "warning" ? "Atención" : ins.type === "success" ? "OK" : "Info"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ins.description}</p>
              </div>
            </div>
          )
          return ins.href ? (
            <Link key={ins.id} href={ins.href}>
              {inner}
            </Link>
          ) : (
            <div key={ins.id}>{inner}</div>
          )
        })}
      </CardContent>
    </Card>
  )
}
