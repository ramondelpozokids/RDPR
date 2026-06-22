"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, List, Receipt, ShoppingCart, Landmark, Link2, BookMarked } from "lucide-react"

const TABS = [
  { href: "/dashboard/finance", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/finance/expenses", label: "Gastos", icon: ShoppingCart },
  { href: "/dashboard/finance/banking", label: "Banca", icon: Landmark },
  { href: "/dashboard/finance/reconciliation", label: "Conciliación", icon: Link2 },
  { href: "/dashboard/finance/journal", label: "Libro diario", icon: BookOpen },
  { href: "/dashboard/finance/ledger", label: "Libro mayor", icon: BookMarked },
  { href: "/dashboard/finance/accounts", label: "Plan contable", icon: List },
  { href: "/dashboard/finance/vat", label: "IVA trimestre", icon: Receipt },
]

export function FinanceNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-1 p-1 rounded-xl border bg-muted/40 mb-6">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard/finance" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
