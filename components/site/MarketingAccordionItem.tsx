"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type MarketingAccordionItemProps = {
  title: string
  summary?: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export function MarketingAccordionItem({
  title,
  summary,
  icon,
  children,
  defaultOpen = false,
}: MarketingAccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-surface-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 p-6 text-left hover:bg-surface-muted/30 transition-colors"
        aria-expanded={open}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="flex-1 min-w-0">
          <span className="font-bold text-lg block">{title}</span>
          {summary && <span className="text-sm text-text-muted mt-0.5 block">{summary}</span>}
        </span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 mt-1 text-text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-surface-border pt-4">
          {children}
        </div>
      )}
    </div>
  )
}
