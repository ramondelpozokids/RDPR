import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { TaxModelsShowcase } from "@/components/site/TaxModelsShowcase"
import { Shield, Lock, FileCheck2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Modelos fiscales AEAT",
  description: "Modelos 303, 390, 111, 130, 200 y 347 integrados en RDPR Tax Intelligence.",
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

      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        {[
          {
            icon: FileCheck2,
            title: "303 y 390 — IVA",
            text: "Autoliquidación trimestral o mensual y resumen anual del IVA desde asientos y facturas.",
          },
          {
            icon: Shield,
            title: "111, 130 y 190 — Retenciones e IRPF",
            text: "Retenciones practicadas, pagos fraccionados de autónomos y resumen anual.",
          },
          {
            icon: Lock,
            title: "200 y 347 — Sociedades y terceros",
            text: "Impuesto de Sociedades estimado y operaciones con terceros superiores al umbral legal.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 p-5 rounded-2xl border border-surface-border bg-white">
            <Icon size={22} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold mb-1">{title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t text-center">
        <p className="text-text-secondary mb-4">Acceso completo tras registro en RDPR OS</p>
        <Link href="/register" className="btn-primary inline-flex">Solicitar acceso</Link>
      </section>
    </>
  )
}
