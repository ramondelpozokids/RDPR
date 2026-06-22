// components/ui/StatCard.tsx
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label:       string
  value:       string | number
  icon:        LucideIcon
  iconColor:   string   // e.g. "text-brand-600"
  iconBg:      string   // e.g. "bg-brand-50"
  trend?:      { value: number; label: string }
  className?:  string
}

export function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, className }: StatCardProps) {
  return (
    <div className={cn("card flex items-center gap-4 py-4", className)}>
      <div className={cn("p-2.5 rounded-xl shrink-0", iconBg)}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary mb-0.5 truncate">{label}</p>
        <p className="text-xl font-semibold text-text-primary">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-0.5", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
