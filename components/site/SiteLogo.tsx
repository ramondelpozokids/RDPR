"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SITE_IMAGES, SITE_NAME, SITE_TAGLINE } from "@/lib/site/config"

type SiteLogoProps = {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string | false
  variant?: "default" | "light"
}

const SIZES = {
  sm: { img: 32, text: "text-sm" },
  md: { img: 40, text: "text-base" },
  lg: { img: 56, text: "text-lg" },
}

export function SiteLogo({ className, size = "md", showText = true, href = "/", variant = "default" }: SiteLogoProps) {
  const s = SIZES[size]
  const inner = (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <Image
        src={SITE_IMAGES.logo}
        alt={`${SITE_NAME} logo`}
        width={s.img}
        height={s.img}
        className="rounded-lg object-contain shrink-0 group-hover:opacity-90 transition-opacity"
        priority={size !== "sm"}
      />
      {showText && (
        <div className="min-w-0">
          <p className={cn(
            "font-semibold tracking-tight leading-none",
            s.text,
            variant === "light" ? "text-white" : "text-text-primary"
          )}>
            {SITE_NAME}
          </p>
          <p className={cn(
            "text-[10px] leading-tight mt-0.5 hidden sm:block",
            variant === "light" ? "text-white/55" : "text-text-muted"
          )}>
            {SITE_TAGLINE}
          </p>
        </div>
      )}
    </div>
  )

  if (href !== false) {
    return (
      <Link href={href ?? "/"} className="shrink-0">
        {inner}
      </Link>
    )
  }
  return inner
}
