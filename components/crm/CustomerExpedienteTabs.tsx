"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "proyectos", label: "Proyectos" },
  { id: "facturas", label: "Facturas" },
  { id: "documentos", label: "Documentos" },
  { id: "portal", label: "Portal" },
] as const

type TabId = (typeof TABS)[number]["id"]

export function CustomerExpedienteTabs({ customerId }: { customerId: string }) {
  const searchParams = useSearchParams()
  const active = (searchParams.get("tab") as TabId) || "resumen"

  return (
    <nav className="flex gap-1 border-b border-surface-border mb-6 overflow-x-auto">
      {TABS.map(({ id, label }) => (
        <Link
          key={id}
          href={`/dashboard/crm/${customerId}?tab=${id}`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            active === id
              ? "border-brand-500 text-brand-600"
              : "border-transparent text-text-muted hover:text-text-primary"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function getActiveCustomerTab(tab: string | null): TabId {
  if (tab && TABS.some((t) => t.id === tab)) return tab as TabId
  return "resumen"
}
