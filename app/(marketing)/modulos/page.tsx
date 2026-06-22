import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Wallet, Users, Layers, FolderOpen, Brain } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { StockImage } from "@/components/site/StockImage"
import type { StockImageKey } from "@/lib/site/stock-images"

export const metadata: Metadata = {
  title: "Módulos",
  description: "Finanzas, CRM, proyectos, documentos e inteligencia artificial en RDPR OS.",
}

const MODULES: Array<{
  icon: typeof Wallet
  title: string
  desc: string
  image: StockImageKey
}> = [
  {
    icon: Wallet,
    title: "RDPR Finance",
    desc: "Facturación, eFactura, Tax Intelligence (303·390·347), contabilidad, banca e IA financiera.",
    image: "accountingDesk",
  },
  {
    icon: Users,
    title: "CRM comercial",
    desc: "Embudo de ventas visual, oportunidades y seguimiento de clientes en cada fase.",
    image: "handshakeDeal",
  },
  {
    icon: Layers,
    title: "Proyectos",
    desc: "Tareas por fases, costes, rentabilidad y control de recursos del equipo.",
    image: "projectPlanning",
  },
  {
    icon: FolderOpen,
    title: "Documentos",
    desc: "Archivo digital seguro, contratos, justificantes y documentación de clientes.",
    image: "secureDocuments",
  },
  {
    icon: Brain,
    title: "RDPR Intelligence",
    desc: "Consultas en lenguaje natural con datos reales de tu empresa.",
    image: "dataAnalytics",
  },
]

export default function ModulosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Módulos"
        title="Todo el negocio. Un solo sistema."
        description="Finanzas, CRM, proyectos, documentos e IA conectados. Cada módulo con una función clara, sin solapamientos."
      />

      <section className="py-16 px-4 sm:px-6 space-y-16 max-w-5xl mx-auto">
        {MODULES.map(({ icon: Icon, title, desc, image }, i) => {
          const sectionId = title.includes("Finance") ? "finance" : title.includes("CRM") ? "crm" : undefined
          return (
            <div
              key={title}
              id={sectionId}
              className={`grid md:grid-cols-2 gap-10 items-center scroll-mt-24 ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
            >
              <StockImage
                name={image}
                className={`aspect-[4/3] rounded-2xl border border-surface-border shadow-lg ${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}
                width={900}
              />
              <div className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{title}</h2>
                <p className="text-text-secondary leading-relaxed mb-4">{desc}</p>
                <Link href="/register" className="text-sm text-brand-600 font-medium inline-flex items-center gap-1 hover:underline">
                  Solicitar acceso <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
