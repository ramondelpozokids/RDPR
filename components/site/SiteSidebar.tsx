"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Layers, Brain, CreditCard, Users, Sparkles, LayoutGrid, LogIn, ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE_NAV } from "@/lib/site/config"

const ICONS: Record<string, typeof Home> = {
  "/": Home,
  "/servicios": Layers,
  "/plataforma": LayoutGrid,
  "/modulos": LayoutGrid,
  "/modelos-fiscales": Brain,
  "/inteligencia": Brain,
  "/precios": CreditCard,
  "/contacto": Users,
  "/nosotros": Users,
}

type SiteSidebarProps = {
  className?: string
  onNavigate?: () => void
  /** drawer = menú móvil; desktop = barra lateral fija */
  variant?: "desktop" | "drawer"
}

export function SiteSidebar({ className, onNavigate, variant = "desktop" }: SiteSidebarProps) {
  const pathname = usePathname()
  const isDrawer = variant === "drawer"

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-surface-border bg-white flex flex-col",
        isDrawer ? "flex-1 w-full border-0 min-h-0" : "w-60 hidden lg:flex",
        className
      )}
    >
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">
          Explorar
        </p>
        {SITE_NAV.map(({ href, label, description }) => {
          const Icon = ICONS[href] ?? Sparkles
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                active
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              )}
            >
              <Icon size={16} className={cn("shrink-0 mt-0.5", active ? "text-white" : "text-brand-500")} />
              <span className="min-w-0">
                <span className="font-medium block">{label}</span>
                {description && (
                  <span className={cn("text-[11px] line-clamp-2 mt-0.5 block", active ? "text-white/75" : "text-text-muted")}>
                    {description}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-surface-border space-y-2">
        <Link
          href="/register"
          onClick={onNavigate}
          className="btn-primary w-full justify-center text-sm py-2.5"
        >
          Solicitar demo
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/login"
          onClick={onNavigate}
          className="btn-secondary w-full justify-center text-sm py-2.5"
        >
          <LogIn size={14} />
          Acceder
        </Link>
      </div>
    </aside>
  )
}
