import { StockImage } from "@/components/site/StockImage"
import type { StockImageKey } from "@/lib/site/stock-images"
import { cn } from "@/lib/utils"

type SectionDividerProps = {
  name: StockImageKey
  className?: string
}

export function SectionDivider({ name, className }: SectionDividerProps) {
  return (
    <div className={cn("relative h-28 sm:h-36 md:h-44 overflow-hidden border-y border-surface-border", className)}>
      <StockImage name={name} className="absolute inset-0" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/20 to-black/35" aria-hidden />
    </div>
  )
}
