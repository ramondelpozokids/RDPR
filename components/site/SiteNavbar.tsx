"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { SiteLogo } from "@/components/site/SiteLogo"
import { SiteSidebar } from "@/components/site/SiteSidebar"

export function SiteNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-surface-border/80 bg-white/85 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-icon shrink-0"
              aria-label="Abrir menú lateral"
            >
              <Menu size={20} />
            </button>
            <SiteLogo size="sm" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Solicitar demo
            </Link>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-surface-border shadow-xl flex flex-col min-h-0 animate-in">
            <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
              <SiteLogo size="sm" href={false} />
              <button type="button" onClick={() => setSidebarOpen(false)} className="btn-icon" aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <SiteSidebar variant="drawer" onNavigate={() => setSidebarOpen(false)} className="flex-1 min-h-0" />
          </aside>
        </div>
      )}
    </>
  )
}
