import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Shield, Zap, Building2 } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SITE_IMAGES } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Plataforma",
  description: "Descubre cómo RDPR OS conecta finanzas, operaciones e inteligencia artificial en un solo sistema.",
}

export default function PlataformaPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Plataforma"
        title="El sistema nervioso de tu empresa"
        description="RDPR OS unifica contabilidad, CRM, proyectos, facturación y documentos con datos aislados por empresa y visión consolidada para holdings."
        image={SITE_IMAGES.plataforma}
        imageAlt="Plataforma RDPR OS"
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-xl order-2 md:order-1">
            <Image src={SITE_IMAGES.futurista} alt="Interfaz futurista RDPR" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-2xl font-bold">Diseñada para empresas reales</h2>
            <p className="text-text-secondary leading-relaxed">
              CourtManager Pro, BOOKIA Publisher, Creauna y el resto del Portfolio Ramón operan con la misma base. Cambia de empresa en un clic sin perder contexto.
            </p>
            <ul className="space-y-3">
              {[
                "Multi-empresa y multi-tenant seguro",
                "Contabilidad PGC con asientos automáticos",
                "Conciliación bancaria e informes ejecutivos",
                "RDPR Intelligence con datos reales",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check size={16} className="text-brand-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white border-y border-surface-border">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-empresa", desc: "Holdings y filiales desde un único acceso." },
            { icon: Shield, title: "Datos aislados", desc: "Cada empresa con su propio tenant seguro." },
            { icon: Zap, title: "Rápida y clara", desc: "Interfaz limpia inspirada en las mejores SaaS." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-surface-border bg-surface-muted/30">
              <Icon size={22} className="text-brand-500 mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 text-center">
        <Link href="/register" className="btn-primary inline-flex py-3 px-8">
          Probar la plataforma
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
