import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { TaxModelsShowcase } from "@/components/site/TaxModelsShowcase"
import { TAX_MODEL_CATEGORIES, TAX_MODELS } from "@/lib/tax/models-registry"

export const metadata: Metadata = {
  title: "Modelos fiscales AEAT",
  description: "Catálogo de modelos AEAT en RDPR Tax Intelligence: IVA, IRPF, retenciones, sociedades e intracomunitario.",
  keywords: ["modelo 303", "modelo 390", "modelo 200", "impuesto sociedades", "modelo 347"],
}

export default function ModelosFiscalesPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Fiscal · AEAT"
        title="Modelos fiscales con datos reales"
        description="RDPR Tax Intelligence calcula modelos orientativos desde su contabilidad y facturación. Exportación CSV y calendario de vencimientos."
      />

      <TaxModelsShowcase compact />

      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        {(Object.keys(TAX_MODEL_CATEGORIES) as Array<keyof typeof TAX_MODEL_CATEGORIES>).map((cat) => {
          const models = TAX_MODELS.filter((m) => m.category === cat)
          const { label, description } = TAX_MODEL_CATEGORIES[cat]
          return (
            <div key={cat} className="p-5 rounded-2xl border border-surface-border bg-white">
              <h2 className="font-bold mb-1">{label}</h2>
              <p className="text-sm text-text-muted mb-4">{description}</p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {models.map((m) => (
                  <li key={m.id} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="font-bold text-brand-600 tabular-nums shrink-0">{m.code}</span>
                    <span>{m.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t text-center">
        <p className="text-text-secondary mb-4">Acceso completo tras registro en RDPR OS</p>
        <Link href="/register" className="btn-primary inline-flex">Solicitar acceso</Link>
      </section>
    </>
  )
}
