import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MonthlyRevenue } from "@/lib/dashboard/get-executive-stats"

export function MonthlyRevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturación · 6 meses</CardTitle>
        <CardDescription>Importe emitido por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-36">
          {data.map((d) => {
            const pct = max > 0 ? (d.total / max) * 100 : 0
            return (
              <div key={`${d.year}-${d.month}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                  {d.total > 0 ? formatCurrency(d.total).replace("€", "").trim() : "—"}
                </span>
                <div className="w-full flex items-end justify-center flex-1">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary transition-all"
                    style={{ height: `${Math.max(pct, d.total > 0 ? 4 : 0)}%` }}
                    title={`${d.label}: ${formatCurrency(d.total)}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
