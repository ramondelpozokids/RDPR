import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Shield, Zap, Building2 } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { ProductModulesCatalog } from "@/components/site/ProductModulesCatalog"
import { AdvisoryAreasSection } from "@/components/site/AdvisoryAreasSection"
import { StockImage } from "@/components/site/StockImage"
import { stockUrl } from "@/lib/site/stock-images"
import { RDPR_DIFFERENTIATION } from "@/lib/site/gestoria-vision"

export const metadata: Metadata = {
  title: "Plataforma",
  description:
    "RDPR OS: gestoría + ERP + jurídico + IA. Contabilidad, impuestos, laboral, documentación y portal del cliente en un ecosistema.",
}

export default function PlataformaPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Plataforma"
        title={RDPR_DIFFERENTIATION.headline}
        description="Contabilidad, fiscal, laboral, mercantil, jurídico, financiero y documental — con IA que responde con datos reales."
        image={stockUrl("modernOffice", 1200)}
        imageAlt="Oficina moderna con tecnología de gestión"
      />

      <section className="py-12 px-4 sm:px-6 bg-brand-50/40 border-b border-surface-border">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {RDPR_DIFFERENTIATION.stack.map((pill) => (
              <span key={pill} className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500 text-white">
                {pill}
              </span>
            ))}
          </div>
          <p className="text-text-secondary leading-relaxed">{RDPR_DIFFERENTIATION.body}</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <StockImage
            name="teamMeeting"
            className="aspect-[4/3] rounded-2xl border border-surface-border shadow-xl order-2 md:order-1"
            width={900}
          />
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-2xl font-bold">Diseñada para asesorías y empresas reales</h2>
            <p className="text-text-secondary leading-relaxed">
              No es solo contabilidad: es la operativa completa de una gestoría moderna con software propio,
              portal del cliente e inteligencia artificial integrada.
            </p>
            <ul className="space-y-3">
              {[
                "Varias empresas o marcas en un mismo entorno",
                "Modelos AEAT conectados a la contabilidad",
                "Expediente 360° por cliente",
                "Consultas IA sobre fiscal, nóminas y tesorería",
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

      <ProductModulesCatalog compact />

      <AdvisoryAreasSection limit={4} showAllLink />

      <section className="py-16 px-4 sm:px-6 bg-white border-y border-surface-border">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-empresa", desc: "Holdings y filiales desde un único acceso." },
            { icon: Shield, title: "Datos separados", desc: "Cada empresa con su espacio de información." },
            { icon: Zap, title: "Rápida y clara", desc: "Interfaz limpia, sin jerga innecesaria." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-surface-border bg-surface-muted/30">
              <Icon size={22} className="text-brand-500 mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 text-center space-y-4">
        <Link href="/modulos" className="btn-secondary inline-flex mr-3">
          Ver módulos
          <ArrowRight size={16} />
        </Link>
        <Link href="/register" className="btn-primary inline-flex py-3 px-8">
          Probar la plataforma
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
