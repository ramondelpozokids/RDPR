import Link from "next/link"
import Image from "next/image"
import { MessageCircle, ArrowUpRight } from "lucide-react"
import { SiteLogo } from "@/components/site/SiteLogo"
import { FOOTER_LINKS, SITE_IMAGES, CONTACT_EMAIL, CEO_NAME, LEGAL_COMPANY_NAME } from "@/lib/site/config"

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border bg-[#0A0A0B] text-white mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <SiteLogo size="sm" href="/" variant="light" />
            <p className="text-sm text-white/75 leading-relaxed max-w-xs">
              La plataforma inteligente para dirigir empresas, proyectos y finanzas desde un único lugar.
            </p>
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 opacity-90">
              <Image src={SITE_IMAGES.favicon} alt="RDPR favicon" fill className="object-cover" sizes="64px" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-4">Producto</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.producto.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-4">Empresa</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.empresa.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-4">Acceso</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.acceso.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/65">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-white/10">
            <Image
              src={SITE_IMAGES.chatAssistant}
              alt="Asistente RDPR Inteligencia"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
              <MessageCircle size={16} className="text-brand-300" />
              Asistente RDPR Inteligencia
            </p>
            <p className="text-sm text-white/70 mt-1 max-w-md">
              Pregunta a tu negocio en lenguaje natural: facturación, cobros, alertas fiscales y más.
            </p>
          </div>
          <Link
            href="/inteligencia"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Probar asistente
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} {LEGAL_COMPANY_NAME} · {CEO_NAME}
          </p>
          <p className="text-xs text-white/50">RDPR OS · Gestión empresarial y asesoría digital</p>
        </div>
      </div>
    </footer>
  )
}
