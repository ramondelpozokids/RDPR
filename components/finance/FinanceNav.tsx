"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { RDPR_FINANCE_GROUPS, RDPR_FINANCE_TAGLINE } from "@/lib/finance/structure"

export function FinanceNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard/finance") return pathname === href
    if (href === "/dashboard/intelligence") return pathname.startsWith("/dashboard/intelligence")
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 px-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{RDPR_FINANCE_TAGLINE}</p>
      </div>
      <div className="flex flex-col gap-3">
        {RDPR_FINANCE_GROUPS.map((group) => (
          <div key={group.id} className="rounded-xl border bg-muted/30 p-1.5">
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/70"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                    {badge && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
