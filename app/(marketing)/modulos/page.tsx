import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Wallet, Users, Layers, BookOpen, Brain } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SITE_IMAGES } from "@/lib/site/config"

export const metadata: Metadata = {
  title: "Módulos",
  description: "Finanzas, CRM, proyectos, facturación, editorial e inteligencia artificial en RDPR OS.",
}

const MODULES = [
  {
    icon: Wallet,
    title: "RDPR Finance",
    desc: "Facturación, eFactura, Tax Intelligence (303·390·347), contabilidad, banca e IA financiera.",
    image: SITE_IMAGES.business,
  },
  {
    icon: Users,
    title: "CRM comercial",
    desc: "Pipeline Kanban, oportunidades y seguimiento de clientes.",
    image: SITE_IMAGES.negocio,
  },
  {
    icon: Layers,
    title: "Proyectos",
    desc: "Kanban de tareas, costes, rentabilidad y control de recursos.",
    image: SITE_IMAGES.proyectos,
  },
  {
    icon: BookOpen,
    title: "Editorial",
    desc: "Autores, libros, regalías e ISBN para BOOKIA Publisher.",
    image: SITE_IMAGES.presentacion,
  },
  {
    icon: Brain,
    title: "RDPR Intelligence",
    desc: "Consultas en lenguaje natural con datos reales de tu empresa.",
    image: SITE_IMAGES.inteligencia,
  },
]

export default function ModulosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Módulos"
        title="Todo el negocio. Un solo sistema."
        description="Módulos diseñados para holdings, SaaS, editoriales y empresas de servicios. Cada pieza conectada con las demás."
        image={SITE_IMAGES.negocio}
        imageAlt="Módulos de negocio RDPR"
      />

      <section className="py-16 px-4 sm:px-6 space-y-16 max-w-5xl mx-auto">
        {MODULES.map(({ icon: Icon, title, desc, image }, i) => (
          <div
            key={title}
            className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
          >
            <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-lg ${i % 2 === 1 ? "md:[direction:ltr]" : ""}`}>
              <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
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
