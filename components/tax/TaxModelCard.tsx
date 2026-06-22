import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { TaxModelDefinition } from "@/lib/tax/models-registry"
import { ArrowRight } from "lucide-react"

export function TaxModelCard({
  model,
  amount,
  periodLabel,
}: {
  model: TaxModelDefinition
  amount?: string
  periodLabel?: string
}) {
  const Icon = model.icon
  const href =
    model.v1 && model.status === "active"
      ? `/dashboard/finance/taxes/${model.id}`
      : "/dashboard/finance/taxes"

  return (
    <Link href={href}>
      <Card className="h-full hover:border-brand-200 hover:shadow-md transition-all">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">{model.shortName}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{model.name}</p>
              </div>
            </div>
            {model.v1 ? (
              <Badge variant="success" className="text-[9px]">V1</Badge>
            ) : (
              <Badge variant="muted" className="text-[9px]">Próximamente</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
          {amount && (
            <p className="text-lg font-bold mt-3 font-mono">{amount}</p>
          )}
          {periodLabel && (
            <p className="text-[10px] text-muted-foreground mt-1">{periodLabel}</p>
          )}
          {model.v1 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 mt-3">
              Abrir <ArrowRight size={12} />
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
