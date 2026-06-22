import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth/config"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { SITE_IMAGES } from "@/lib/site/config"
import DashboardPreview from "@/components/landing/DashboardPreview"

export const metadata: Metadata = {
  title: "RDPR OS — La plataforma inteligente para dirigir empresas",
  description:
    "Gestiona operaciones, contabilidad, proyectos, clientes y crecimiento empresarial con inteligencia artificial avanzada.",
}

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <>
      <section className="landing-hero relative overflow-hidden">
        <div className="landing-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1.5">
                <Sparkles size={12} />
                Business Operating System
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
                  Dirige tu empresa con inteligencia operativa
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Finanzas, CRM, proyectos y IA en una sola plataforma. Diseñada por empresarios para empresarios que gestionan holdings y múltiples negocios.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary justify-center py-3 px-6 text-base shadow-lg shadow-brand-500/20">
                  Solicitar demostración
                  <ArrowRight size={18} />
                </Link>
                <Link href="/plataforma" className="btn-secondary justify-center py-3 px-6 text-base">
                  Ver plataforma
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Multi-empresa</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> PGC español</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> IA integrada</span>
              </div>
            </div>
            <div className="relative landing-float">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-transparent rounded-3xl blur-2xl" aria-hidden />
              <div className="relative rounded-2xl overflow-hidden border border-surface-border shadow-2xl aspect-[4/3]">
                <Image src={SITE_IMAGES.hero} alt="RDPR OS — dashboard empresarial" fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-surface-border bg-white py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-border shadow-lg">
            <Image src={SITE_IMAGES.presentacion} alt="Presentación RDPR OS" fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Una vista, todo el negocio</h2>
            <p className="text-text-secondary leading-relaxed">
              Abre RDPR por la mañana y ve finanzas, ventas, proyectos y alertas importantes. Sin saltar entre Excel, CRM y banca.
            </p>
            <Link href="/modulos" className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-4 hover:underline">
              Explorar módulos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Vista previa del dashboard</h2>
          <DashboardPreview />
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-brand-50 via-white to-violet-50 border-t border-surface-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">¿Listo para tomar el control?</h2>
          <p className="text-text-secondary text-lg mb-8">
            Solicita una demo personalizada con el equipo de Portfolio Ramón.
          </p>
          <Link href="/register" className="btn-primary justify-center py-3 px-8 text-base inline-flex">
            Solicitar demostración
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
