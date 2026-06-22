"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const LINKS = [
  { href: "#producto", label: "Producto" },
  { href: "#modulos",  label: "Módulos" },
  { href: "#ia",       label: "Inteligencia" },
  { href: "#precios",  label: "Precios" },
]

export default function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-text-primary tracking-tight">RDPR OS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2">
            Solicitar demo
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="md:hidden btn-icon"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 py-4 space-y-1 animate-in">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-text-secondary hover:text-text-primary"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-surface-border mt-2">
            <Link href="/login" className="btn-secondary justify-center" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary justify-center" onClick={() => setOpen(false)}>
              Solicitar demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
