// components/layout/Sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, Users, FolderKanban,
  FolderOpen, Settings, LogOut, Menu, X, ChevronRight, Sparkles, Wallet,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import CompanySwitcher from "@/components/layout/CompanySwitcher"
import BrandSwitcher from "@/components/layout/BrandSwitcher"
import type { CompanyOption } from "@/lib/company/context"
import type { BrandOption } from "@/lib/brands/context"
import { SITE_IMAGES } from "@/lib/site/config"

const NAV_ITEMS = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Inicio"      },
  { href: "/dashboard/crm",       icon: Users,           label: "CRM"         },
  { href: "/dashboard/projects",  icon: FolderKanban,    label: "Proyectos"   },
  { href: "/dashboard/finance",   icon: Wallet,          label: "RDPR Finance" },
  { href: "/dashboard/intelligence", icon: Sparkles,    label: "Intelligence" },
  { href: "/dashboard/documents", icon: FolderOpen,      label: "Documentos"  },
  { href: "/dashboard/settings",  icon: Settings,        label: "Ajustes"     },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  companies: CompanyOption[]
  activeCompanyId: string
  organizationName?: string | null
  brands?: BrandOption[]
  activeBrandId?: string | null
  legalName?: string
}

function NavContent({
  user,
  companies,
  activeCompanyId,
  organizationName,
  brands = [],
  activeBrandId = null,
  legalName = "",
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <Image src={SITE_IMAGES.logo} alt="RDPR OS" width={32} height={32} className="rounded-lg object-contain shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-text-primary text-sm block leading-none">RDPR OS</span>
            <span className="block text-[10px] text-text-muted leading-none mt-0.5">Business Suite</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="btn-icon md:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {companies.length > 1 && (
        <CompanySwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
          organizationName={organizationName}
        />
      )}

      {brands.length > 0 && (
        <BrandSwitcher
          brands={brands}
          activeBrandId={activeBrandId}
          legalName={legalName || companies.find((c) => c.id === activeCompanyId)?.name || "Empresa"}
        />
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
          Módulos
        </p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-surface-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-muted transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{user.name ?? "Usuario"}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 btn-icon bg-white border border-surface-border shadow-card"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-border",
        "transform transition-transform duration-200 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent {...props} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar (static) */}
      <aside className="hidden md:flex w-60 shrink-0 bg-white border-r border-surface-border flex-col">
        <NavContent {...props} />
      </aside>
    </>
  )
}
