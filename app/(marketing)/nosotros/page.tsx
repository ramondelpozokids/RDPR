import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, Target, Heart } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { StockImage } from "@/components/site/StockImage"
import { SITE_IMAGES, CEO_NAME, CEO_TITLE, CONTACT_EMAIL, LEGAL_COMPANY_NAME } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Nosotros",
  description: `Conoce a ${CEO_NAME}, fundador y CEO de ${LEGAL_COMPANY_NAME}, y al equipo detrás de RDPR OS.`,
}

export default function NosotrosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Empresa"
        title="Construido por quien dirige empresas de verdad"
        description={`${LEGAL_COMPANY_NAME} desarrolla RDPR OS para unificar finanzas, clientes y fiscalidad en un solo sistema — pensado para gestorías y empresas de servicios.`}
      />

      <section id="ceo" className="py-16 px-4 sm:px-6 bg-white border-y border-surface-border scroll-mt-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden border border-surface-border shadow-xl">
            <Image
              src={SITE_IMAGES.ceoOficina}
              alt={`${CEO_NAME}, fundador y CEO`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Fundador y CEO</p>
              <h2 className="text-3xl font-bold tracking-tight">{CEO_NAME}</h2>
              <p className="text-text-muted mt-1">{CEO_TITLE}</p>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Dirige un ecosistema de marcas — CourtManager Pro, BOOKIA Publisher, Creauna — bajo {LEGAL_COMPANY_NAME}. RDPR OS nace de años gestionando operaciones reales con herramientas dispersas.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Objetivo: que cualquier empresario abra una sola plataforma por la mañana y tenga la misma claridad que una gestoría bien organizada.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn-secondary inline-flex">
              Contactar con el CEO
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{LEGAL_COMPANY_NAME}</h2>
            <p className="text-text-secondary leading-relaxed">
              Una razón social, múltiples marcas comerciales. RDPR OS conecta contabilidad, facturación electrónica, modelos AEAT e inteligencia artificial.
            </p>
            <Link href="/servicios" className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1">
              Ver servicios <ArrowRight size={14} />
            </Link>
          </div>
          <StockImage
            name="companyBuilding"
            className="aspect-[4/3] rounded-2xl border border-surface-border shadow-lg"
            width={900}
          />
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-surface-muted/40">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-marca", desc: "Varias líneas de negocio bajo una sola razón social." },
            { icon: Target, title: "Enfoque práctico", desc: "Software que resuelve tesorería, ventas y cumplimiento fiscal." },
            { icon: Heart, title: "Compromiso", desc: "Usado internamente antes de ofrecerse a clientes." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-white border border-surface-border">
              <Icon size={22} className="text-brand-500 mb-3" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 text-center">
        <Link href="/contacto" className="btn-primary inline-flex py-3 px-8">
          Solicitar consulta
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
