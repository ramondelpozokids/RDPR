import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { TaxModelsShowcase } from "@/components/site/TaxModelsShowcase"
import { AeatOfficialDownloads } from "@/components/site/AeatOfficialDownloads"
import { TaxModelCategoriesAccordion } from "@/components/site/TaxModelCategoriesAccordion"
import { SectionDivider } from "@/components/site/SectionDivider"

export const metadata: Metadata = {
  title: "Modelos fiscales AEAT",
  description:
    "Catálogo de modelos fiscales AEAT con acceso público a la Sede electrónica de la Agencia Tributaria.",
  keywords: ["modelo 303", "modelo 390", "modelo 200", "impuesto sociedades", "modelo 347", "AEAT"],
}

export default function ModelosFiscalesPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Fiscal · AEAT"
        title="Modelos fiscales y acceso oficial"
        description="Consulte el catálogo de modelos AEAT y acceda directamente a la Sede electrónica para presentar declaraciones y descargar documentación oficial."
      />

      <SectionDivider name="taxBanner" />

      <TaxModelsShowcase compact linkToOfficial />

      <SectionDivider name="fiscalArea" />

      <AeatOfficialDownloads />

      <SectionDivider name="accountingArea" />

      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <TaxModelCategoriesAccordion />
      </section>

      <section className="py-12 px-4 sm:px-6 bg-surface-muted/50 border-t text-center">
        <p className="text-text-secondary mb-4">¿Necesita asesoramiento personalizado?</p>
        <Link href="/contacto" className="btn-primary inline-flex">
          Solicitar consulta
        </Link>
      </section>
    </>
  )
}
