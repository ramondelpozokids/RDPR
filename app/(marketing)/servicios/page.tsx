import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { AdvisoryAreasSection } from "@/components/site/AdvisoryAreasSection"
import { SectionDivider } from "@/components/site/SectionDivider"
import { SERVICES } from "@/lib/site/marketing-content"
import { stockUrl } from "@/lib/site/stock-images"

export const metadata: Metadata = {
  title: "Servicios de asesoría y gestión empresarial",
  description:
    "Asesoría fiscal, contable, laboral, mercantil, jurídica, financiera y documental apoyada en RDPR OS — gestoría + ERP + IA.",
  keywords: ["asesoría contable", "asesoría fiscal", "gestoría online", "asesoría laboral", "asesoría mercantil"],
}

export default function ServiciosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Servicios"
        title="Toda la vida administrativa de su empresa"
        description="Asesoría fiscal, contable, laboral, mercantil, jurídica, financiera y documental con el respaldo de RDPR OS."
        image={stockUrl("consultationCall", 1200)}
        imageAlt="Consultoría profesional a empresas"
      />

      <SectionDivider name="consultationCall" />

      <AdvisoryAreasSection
        accordionAreaIds={["fiscal", "contable", "laboral"]}
        withAreaDividers
      />

      <SectionDivider name="fiscalArea" />

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">Servicios disponibles hoy</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {SERVICES.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-surface-border bg-white p-6 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <Icon size={22} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>
                <span className="text-sm font-medium text-brand-600 inline-flex items-center gap-1">
                  Más información <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
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
