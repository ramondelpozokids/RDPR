import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, LineChart } from "lucide-react"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import AIChatDemo from "@/components/landing/AIChatDemo"
import { stockUrl } from "@/lib/site/stock-images"

export const metadata: Metadata = {
  title: "Inteligencia IA",
  description: "RDPR Intelligence y asistente empresarial con datos reales de tu negocio.",
}

const QUESTIONS = [
  "¿Cuál fue mi beneficio el último trimestre?",
  "¿Qué clientes generan más ingresos?",
  "¿Qué proyecto está perdiendo dinero?",
  "¿Cuánto IVA tendré que pagar este trimestre?",
  "¿Cómo está mi tesorería proyectada?",
  "¿Hay alertas contables?",
]

export default function InteligenciaPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Inteligencia artificial"
        title="Finanzas, operaciones e IA trabajando juntas"
        description="Pregunta en lenguaje natural. RDPR consulta tu base de datos y responde con cifras reales, alertas y acciones recomendadas."
        image={stockUrl("aiWorkspace", 1200)}
        imageAlt="Espacio de trabajo con inteligencia artificial"
        dark
        className="border-b border-white/10"
      />

      <section className="py-16 px-4 sm:px-6 bg-[#0A0A0B] text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Asistente empresarial</h2>
            <p className="text-white/70 leading-relaxed">
              Entiende contabilidad, facturas, gastos y proyectos. Responde con números de su empresa, no respuestas genéricas.
            </p>
            <ul className="space-y-2.5">
              {QUESTIONS.map((q) => (
                <li key={q} className="flex items-start gap-2 text-sm text-white/70">
                  <LineChart size={14} className="text-violet-400 mt-0.5 shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <AIChatDemo />
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 text-center bg-white">
        <h2 className="text-2xl font-bold mb-4">Activa RDPR Intelligence</h2>
        <p className="text-text-secondary max-w-lg mx-auto mb-8">
          Incluido en planes Business y como add-on Intelligence para predicciones y alertas avanzadas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/precios" className="btn-secondary justify-center py-3 px-6">
            Ver precios
          </Link>
          <Link href="/register" className="btn-primary justify-center py-3 px-6">
            Solicitar acceso
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
