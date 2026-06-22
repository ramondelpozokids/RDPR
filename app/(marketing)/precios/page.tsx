import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SectionDivider } from "@/components/site/SectionDivider"
import { SITE_IMAGES } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes Inicial, Empresa, Corporativo e Inteligencia para RDPR OS.",
}

/** Orden ascendente por precio: 49 → 99 → 149 → 499 */
const PLANS = [
  {
    name: "Inicial",
    tagline: "Para emprendedores",
    price: "49",
    features: ["1 empresa", "Clientes y facturación", "Proyectos básicos", "1 usuario", "Soporte por correo"],
    cta: "Empezar",
    highlight: false,
  },
  {
    name: "Inteligencia",
    tagline: "Complemento de IA avanzada",
    price: "99",
    suffix: "+",
    features: ["RDPR Inteligencia", "Predicciones IA", "Alertas contables", "Flujo de caja", "Conciliación inteligente"],
    cta: "Añadir IA",
    highlight: false,
  },
  {
    name: "Empresa",
    tagline: "Para empresas en crecimiento",
    price: "149",
    features: ["Hasta 10 usuarios", "Finanzas completas", "Informes avanzados", "Varios equipos", "Soporte prioritario"],
    cta: "Solicitar demo",
    highlight: true,
  },
  {
    name: "Corporativo",
    tagline: "Para grupos empresariales",
    price: "499",
    features: ["Multi-empresa", "Consolidación holding", "Acceso corporativo y API", "Auditoría", "Gestor de cuenta"],
    cta: "Contactar",
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

      <SectionDivider name="pricingArea" />

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
              <p className="text-lg font-bold text-text-primary">RDPR {name}</p>
              <p className="text-xs text-text-muted mb-4">{tagline}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold tabular-nums text-text-primary">{price}€</span>
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

      <SectionDivider name="companyBuilding" />

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t border-surface-border">
        <div className="max-w-3xl mx-auto text-center text-sm text-text-secondary space-y-3">
          <p>
            Planes transparentes sin permanencia. Para contratar o ampliar su plan, solicite acceso o contacte con nosotros.
          </p>
          <p>
            <a href="mailto:info@ramondelpozorott.es" className="text-brand-600 hover:underline">info@ramondelpozorott.es</a>
            {" · "}
            <Link href="/contacto" className="text-brand-600 hover:underline">Formulario de contacto</Link>
          </p>
        </div>
      </section>
    </>
  )
}
