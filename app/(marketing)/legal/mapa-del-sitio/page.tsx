import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Map, Shield } from "lucide-react"
import { SITEMAP_SECTIONS, LEGAL_ENTITY, LEGAL_PAGES } from "@/lib/site/legal"
import { SITE_NAV } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Mapa del sitio",
  description: "Índice completo de páginas, recursos legales y accesos de RDPR OS.",
}

export default function MapaDelSitioPage() {
  return (
    <div className="min-h-full">
      <section className="relative overflow-hidden bg-[#0A0A0B] text-white border-b border-white/10">
        <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 border border-white/10 items-center justify-center mb-6">
            <Map size={26} className="text-brand-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Mapa del sitio</h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Navegación estructurada de {LEGAL_ENTITY.tradeName}: producto, empresa, acceso y cumplimiento legal.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Quick links hero grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {SITE_NAV.map(({ href, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group p-5 rounded-2xl border border-surface-border bg-white hover:border-brand-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text-primary group-hover:text-brand-600 transition-colors">{label}</span>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-brand-500 transition-colors" />
              </div>
              {description && <p className="text-xs text-text-muted leading-relaxed">{description}</p>}
            </Link>
          ))}
        </div>

        {/* Legal highlight */}
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-violet-50/40 p-6 sm:p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold">Legal y cumplimiento</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {LEGAL_PAGES.filter((p) => p.href !== "/legal/mapa-del-sitio").map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white/90 border border-surface-border hover:border-brand-200 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.description}</p>
                </div>
                <ArrowUpRight size={14} className="text-text-muted shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Full sitemap sections */}
        <div className="grid sm:grid-cols-2 gap-10">
          {SITEMAP_SECTIONS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4 pb-2 border-b border-surface-border">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-text-secondary hover:text-brand-600 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      {label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted text-center mt-16 pt-8 border-t border-surface-border">
          Última actualización del mapa: {LEGAL_ENTITY.lastUpdated} · {LEGAL_ENTITY.companyName}
        </p>
      </div>
    </div>
  )
}
