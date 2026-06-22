import Link from "next/link"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExecutiveAlert } from "@/lib/dashboard/get-executive-stats"

const ICONS = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

const STYLES = {
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
} as const

export function ExecutiveAlerts({ alerts }: { alerts: ExecutiveAlert[] }) {
  if (alerts.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {alerts.map((alert) => {
            const Icon = ICONS[alert.type]
            const content = (
              <div className={`flex items-start gap-3 px-5 py-3 ${alert.href ? "hover:bg-muted/50 transition-colors" : ""}`}>
                <div className={`p-1.5 rounded-lg border shrink-0 ${STYLES[alert.type]}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
              </div>
            )
            return alert.href ? (
              <Link key={alert.id} href={alert.href}>
                {content}
              </Link>
            ) : (
              <div key={alert.id}>{content}</div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
