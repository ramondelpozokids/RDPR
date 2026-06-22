import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SERVICES } from "@/lib/site/marketing-content"
import { SITE_IMAGES } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Servicios de asesoría y gestión empresarial",
  description:
    "Asesoría contable, fiscal, facturación electrónica, documentación segura e inteligencia artificial para empresas y autónomos.",
  keywords: ["asesoría contable", "asesoría fiscal", "gestoría online", "facturación electrónica"],
}

export default function ServiciosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Servicios"
        title="Asesoría y tecnología para empresas exigentes"
        description="Calidad, eficacia y cercanía. Servicios contables, fiscales y de gestión apoyados en RDPR OS — software propio, no una demo."
        image={SITE_IMAGES.business}
        imageAlt="Servicios RDPR"
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {SERVICES.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-surface-border bg-white p-6 hover:border-brand-200 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <Icon size={22} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-bold mb-2">{title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>
              <span className="text-sm font-medium text-brand-600 inline-flex items-center gap-1">
                Más información <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t border-surface-border text-center">
        <p className="text-text-secondary mb-4">¿Necesita un presupuesto personalizado?</p>
        <Link href="/contacto" className="btn-primary inline-flex">
          Solicitar consulta gratuita
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
