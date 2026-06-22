import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth/config"
import { ArrowRight, Check, Calculator, Receipt, Users, Shield } from "lucide-react"
import { LEGAL_COMPANY_NAME } from "@/lib/site/config"
import { stockUrl } from "@/lib/site/stock-images"
import { TaxModelsShowcase } from "@/components/site/TaxModelsShowcase"
import { SecurityLayers } from "@/components/site/SecurityLayers"
import { SITE_KEYWORDS } from "@/lib/site/marketing-content"

export const metadata: Metadata = {
  title: "Gestoría y asesoría digital para empresas",
  description:
    "Asesoría contable, fiscal y laboral apoyada en RDPR OS. Facturación electrónica, modelos AEAT, documentos cifrados e inteligencia artificial.",
  keywords: [...SITE_KEYWORDS],
}

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <>
      {/* Hero estilo gestoría */}
      <section className="gestoria-hero relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[#0c1929]" aria-hidden />
        <div className="absolute inset-0 opacity-40 hero-drone-overlay" aria-hidden>
          <Image
            src={stockUrl("heroAerial", 1600)}
            alt=""
            fill
            className="object-cover hero-drone-pan"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1929] via-[#0c1929]/92 to-[#0c1929]/75" aria-hidden />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 mb-4">
              {LEGAL_COMPANY_NAME}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-white mb-5">
              Gestoría y asesoría con tecnología de verdad
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
              Calidad, eficacia y cercanía. Contabilidad, fiscalidad, facturación y gestión empresarial en una plataforma 100% operativa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/contacto" className="btn-primary justify-center py-3 px-6 text-base bg-sky-600 hover:bg-sky-700 border-0 shadow-lg">
                Consulta gratuita
                <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-base font-medium border border-white/30 text-white hover:bg-white/10 transition-colors">
                Acceder a RDPR OS
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-sky-400" /> Asesoría contable</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-sky-400" /> Modelos AEAT</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-sky-400" /> Documentos cifrados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios principales */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-surface-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Calculator, label: "CONTABLE", title: "Asesoría contable", desc: "PGC, diario, mayor y conciliación bancaria." },
              { icon: Receipt, label: "FISCAL", title: "Asesoría fiscal", desc: "Modelos 303, 390, 200, 347 y vencimientos." },
              { icon: Users, label: "COMERCIAL", title: "Gestión de clientes", desc: "Embudo de ventas y seguimiento claro." },
            ].map(({ icon: Icon, label, title, desc }) => (
              <div key={label} className="p-6 rounded-2xl border border-surface-border hover:border-sky-200 hover:shadow-sm transition-all">
                <p className="text-[10px] font-bold tracking-widest text-sky-700 mb-2">{label}</p>
                <Icon size={24} className="text-sky-600 mb-3" />
                <h2 className="font-bold text-lg mb-2">{title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/servicios" className="text-sm font-semibold text-brand-600 hover:underline inline-flex items-center gap-1">
              Ver todos los servicios <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <TaxModelsShowcase />

      {/* Plataforma — una sola imagen, sin repetir dashboard */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-xl">
            <Image
              src={stockUrl("dashboardLaptop", 1200)}
              alt="Panel de gestión financiera en portátil"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Plataforma RDPR OS</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Una vista, todo el negocio</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Software de gestión usado internamente antes de ofrecerse al mercado. Facturas, cobros, proyectos y alertas fiscales en un solo panel — sin Excel disperso.
            </p>
            <Link href="/modulos" className="btn-secondary inline-flex text-sm">
              Explorar plataforma <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <SecurityLayers />

      {/* CTA contacto */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-sky-50 via-white to-slate-50 border-t border-surface-border">
        <div className="max-w-3xl mx-auto text-center">
          <Shield size={28} className="mx-auto text-sky-600 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight mb-4">¿Hablamos de su empresa?</h2>
          <p className="text-text-secondary text-lg mb-8">
            Solicite una consulta o envíe documentación de forma cifrada. Pago online con Stripe disponible próximamente, tras constitución de la SL.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contacto" className="btn-primary justify-center py-3 px-8 text-base inline-flex">
              Formulario de contacto
              <ArrowRight size={18} />
            </Link>
            <Link href="/enviar-documentos" className="btn-secondary justify-center py-3 px-8 text-base inline-flex">
              Enviar documentos cifrados
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
