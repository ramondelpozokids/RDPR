import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Wallet, Users, Layers, FolderOpen, Brain } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { ProductModulesCatalog } from "@/components/site/ProductModulesCatalog"
import { StockImage } from "@/components/site/StockImage"
import type { StockImageKey } from "@/lib/site/stock-images"
import { RDPR_DIFFERENTIATION } from "@/lib/site/gestoria-vision"

export const metadata: Metadata = {
  title: "Módulos",
  description:
    "RDPR Accounting, Tax, Finance, CRM, Documents, Intelligence, Payroll, Legal, Portal y más — gestoría + ERP + IA.",
}

/** Módulos con demo visual en profundidad (disponibles hoy). */
const FEATURED: Array<{
  icon: typeof Wallet
  title: string
  desc: string
  image: StockImageKey
  anchor?: string
}> = [
  {
    icon: Wallet,
    title: "RDPR Finance & Tax",
    desc: "Facturación, eFactura, Verifactu, contabilidad PGC, banca y modelos AEAT en un solo flujo.",
    image: "accountingDesk",
    anchor: "finance",
  },
  {
    icon: Users,
    title: "RDPR CRM",
    desc: "Expediente del cliente: datos fiscales, facturas, incidencias, tareas y documentación.",
    image: "handshakeDeal",
    anchor: "crm",
  },
  {
    icon: Layers,
    title: "RDPR Projects",
    desc: "Tareas por fases, costes, rentabilidad y control de recursos del equipo.",
    image: "projectPlanning",
  },
  {
    icon: FolderOpen,
    title: "RDPR Documents",
    desc: "Archivo digital, envío seguro desde el portal y clasificación documental.",
    image: "secureDocuments",
  },
  {
    icon: Brain,
    title: "RDPR Intelligence",
    desc: "Pregunte en lenguaje natural: IVA del trimestre, facturas pendientes, márgenes y gastos deducibles.",
    image: "dataAnalytics",
  },
]

export default function ModulosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Módulos"
        title={RDPR_DIFFERENTIATION.headline}
        description="Finance + Tax + Payroll + Legal + Documents + AI. Un ecosistema pensado para asesorías y empresas exigentes."
      />

      <ProductModulesCatalog />

      <section className="py-16 px-4 sm:px-6 space-y-16 max-w-5xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">En profundidad</h2>
          <p className="text-sm text-text-muted">Módulos activos con acceso en RDPR OS</p>
        </div>
        {FEATURED.map(({ icon: Icon, title, desc, image, anchor }, i) => (
          <div
            key={title}
            id={anchor}
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
        ))}
      </section>
    </>
  )
}
