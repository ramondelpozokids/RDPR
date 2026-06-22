import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, Target, Heart } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
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
        description={`RDPR OS nace del día a día de ${LEGAL_COMPANY_NAME}: gestión financiera, SaaS y servicios profesionales que necesitaban un sistema unificado.`}
        image={SITE_IMAGES.ceoOficina}
        imageAlt={`${CEO_NAME} — CEO RDPR OS`}
      />

      <section id="ceo" className="py-16 px-4 sm:px-6 bg-white border-y border-surface-border scroll-mt-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden border border-surface-border shadow-xl">
            <Image
              src={SITE_IMAGES.ceoOficina}
              alt={`${CEO_NAME} en oficina`}
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
              {CEO_NAME} lidera un ecosistema empresarial que incluye CourtManager Pro, BOOKIA Publisher, Creauna y otras marcas bajo {LEGAL_COMPANY_NAME}. RDPR OS es la respuesta a años gestionando múltiples negocios con herramientas fragmentadas.
            </p>
            <p className="text-text-secondary leading-relaxed">
              La visión: que cualquier empresario pueda abrir una sola plataforma por la mañana y ver finanzas, operaciones y alertas con la misma claridad que una gestoría bien organizada.
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
              Una razón social con múltiples marcas comerciales. RDPR OS es el sistema operativo que conecta finanzas, clientes, proyectos e inteligencia artificial.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-lg">
            <Image
              src={SITE_IMAGES.ceoEscalera}
              alt={`${CEO_NAME}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-surface-muted/40">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-marca", desc: "Experiencia real gestionando filiales y proyectos diversos bajo una sola razón social." },
            { icon: Target, title: "Enfoque práctico", desc: "Software que resuelve problemas de tesorería, ventas y operaciones." },
            { icon: Heart, title: "Compromiso", desc: "Desarrollado y usado internamente antes de ofrecerse al mercado." },
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
        <Link href="/register" className="btn-primary inline-flex py-3 px-8">
          Trabajar con RDPR OS
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
