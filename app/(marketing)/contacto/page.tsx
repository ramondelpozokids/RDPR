import type { Metadata } from "next"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { ContactForm } from "@/components/site/ContactForm"
import { CONTACT_EMAIL } from "@/lib/site/config"
import { stockUrl } from "@/lib/site/stock-images"
import { Mail, Phone, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Formulario de contacto para asesoría contable, fiscal y demo de RDPR OS.",
  keywords: ["contacto gestoría", "asesoría Madrid", "consulta fiscal"],
}

export default function ContactoPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Contacto"
        title="Hablemos de su empresa"
        description="Confíe en asesores expertos. Le respondemos con la mayor brevedad posible."
        image="/asesores.webp"
        imageAlt="Contacto con asesoría profesional"
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Formulario de contacto</h2>
              <ContactForm />
            </div>
          </div>
          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-surface-border bg-white p-6">
              <h3 className="font-semibold mb-4">Datos de contacto</h3>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li className="flex gap-3">
                  <Mail size={18} className="text-brand-500 shrink-0" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand-600">{CONTACT_EMAIL}</a>
                </li>
                <li className="flex gap-3">
                  <Phone size={18} className="text-brand-500 shrink-0" />
                  <span>Consulta telefónica bajo cita</span>
                </li>
                <li className="flex gap-3">
                  <MapPin size={18} className="text-brand-500 shrink-0" />
                  <span>España · RDPR Digital S.L.</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 text-sm text-text-secondary leading-relaxed">
              <p className="font-semibold text-text-primary mb-2">Horario orientativo</p>
              <p>Lunes a viernes: 9:00 – 18:00</p>
              <p className="mt-2">Para documentación confidencial use la{" "}
                <a href="/enviar-documentos" className="text-brand-600 font-medium underline">zona de envío cifrado</a>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
