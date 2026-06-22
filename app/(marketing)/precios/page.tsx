import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SITE_IMAGES } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes Starter, Business, Enterprise e Intelligence para RDPR OS.",
}

const PLANS = [
  {
    name: "Starter",
    tagline: "Para emprendedores",
    price: "49",
    features: ["1 empresa", "CRM y facturación", "Proyectos básicos", "1 usuario", "Soporte email"],
    cta: "Empezar",
    highlight: false,
  },
  {
    name: "Business",
    tagline: "Para empresas en crecimiento",
    price: "149",
    features: ["Hasta 10 usuarios", "Finanzas completas", "Informes avanzados", "Multi-equipo", "Soporte prioritario"],
    cta: "Solicitar demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    tagline: "Para grupos empresariales",
    price: "499",
    features: ["Multi-empresa", "Consolidación holding", "SSO y API", "Auditoría", "Account manager"],
    cta: "Contactar",
    highlight: false,
  },
  {
    name: "Intelligence",
    tagline: "Add-on IA avanzada",
    price: "99",
    suffix: "+",
    features: ["RDPR Intelligence", "Predicciones IA", "Alertas contables", "Flujo de caja", "Conciliación inteligente"],
    cta: "Añadir IA",
    highlight: false,
  },
]

export default function PreciosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Precios"
        title="Inversión en control, no en complejidad"
        description="La inteligencia financiera para empresas que quieren crecer. Sin sorpresas, sin permanencia."
        image={SITE_IMAGES.precios}
        imageAlt="Planes RDPR OS"
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(({ name, tagline, price, suffix, features, cta, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 flex flex-col ${
                highlight
                  ? "border-brand-500 bg-brand-50/30 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20"
                  : "border-surface-border bg-white"
              }`}
            >
              {highlight && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-3">
                  Recomendado
                </span>
              )}
              <p className="text-lg font-bold">RDPR {name}</p>
              <p className="text-xs text-text-muted mb-4">{tagline}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold tabular-nums">{price}€</span>
                {suffix && <span className="text-text-muted text-sm">{suffix}</span>}
                <span className="text-text-muted text-sm">/mes</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={14} className="text-brand-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={highlight ? "btn-primary justify-center" : "btn-secondary justify-center"}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t border-surface-border">
        <div className="max-w-3xl mx-auto text-center text-sm text-text-secondary">
          <p>Precios orientativos para demostración. Contacta en <a href="mailto:info@ramondelpozorott.es" className="text-brand-600 hover:underline">info@ramondelpozorott.es</a> para un presupuesto personalizado.</p>
        </div>
      </section>
    </>
  )
}
