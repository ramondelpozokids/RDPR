import { MetricCard } from "@/components/ui/metric-card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: { value: number; label: string }
  className?: string
}

/** @deprecated Prefer MetricCard — kept for backward compatibility */
export function StatCard(props: StatCardProps) {
  return <MetricCard {...props} />
}
