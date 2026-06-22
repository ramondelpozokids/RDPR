import Link from "next/link"
import Image from "next/image"
import { SiteLogo } from "@/components/site/SiteLogo"
import { FOOTER_LINKS, SITE_IMAGES, CONTACT_EMAIL, CEO_NAME } from "@/lib/site/config"

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border bg-[#0A0A0B] text-white mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <SiteLogo size="sm" href="/" variant="light" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              La plataforma inteligente para dirigir empresas, proyectos y finanzas desde un único lugar.
            </p>
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 opacity-80">
              <Image src={SITE_IMAGES.favicon} alt="RDPR favicon" fill className="object-cover" sizes="64px" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Producto</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.producto.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Empresa</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.empresa.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Acceso</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.acceso.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/50">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/45">© {new Date().getFullYear()} RDPR OS · Portfolio Ramón · {CEO_NAME}</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white/45">
            {FOOTER_LINKS.legal.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white/80 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
