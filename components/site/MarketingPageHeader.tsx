import Image from "next/image"
import { cn } from "@/lib/utils"

type MarketingPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  dark?: boolean
  className?: string
}

export function MarketingPageHeader({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  dark = false,
  className,
}: MarketingPageHeaderProps) {
  return (
    <section className={cn("relative overflow-hidden", dark ? "bg-[#0A0A0B] text-white" : "bg-white border-b border-surface-border", className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className={cn("grid gap-10 items-center", image ? "lg:grid-cols-2" : "")}>
          <div className="space-y-4">
            {eyebrow && (
              <p className={cn("text-xs font-semibold uppercase tracking-wider", dark ? "text-brand-300" : "text-brand-600")}>
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">{title}</h1>
            <p className={cn("text-lg leading-relaxed max-w-xl", dark ? "text-white/65" : "text-text-secondary")}>
              {description}
            </p>
          </div>
          {image && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image src={image} alt={imageAlt ?? title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
