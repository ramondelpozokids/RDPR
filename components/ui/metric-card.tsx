import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-accent",
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("flex items-center gap-4 p-4", className)}>
      <div className={cn("p-2.5 rounded-xl shrink-0", iconBg)}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5 truncate">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-0.5", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </Card>
  )
}
