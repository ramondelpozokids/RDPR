import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompanyBreakdownRow } from "@/lib/dashboard/get-executive-stats"

export function CompanyBreakdown({ rows }: { rows: CompanyBreakdownRow[] }) {
  if (rows.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>Grupo · cobrado este mes</CardTitle>
        <CardDescription>Desglose por empresa del holding</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 px-5 py-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: row.brandColor ?? "#6366f1" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  Emitido {formatCurrency(row.billedMonth)} · {row.sharePct}% del grupo
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground shrink-0">
                {formatCurrency(row.paidMonth)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
