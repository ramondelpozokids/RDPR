import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SecureUploadForm } from "@/components/site/SecureUploadForm"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Enviar documentos",
  description: "Portal seguro para enviar documentación confidencial a RDPR Digital S.L.",
  keywords: ["envío documentos seguro", "documentación gestoría", "portal cliente"],
}

export default function EnviarDocumentosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Documentación"
        title="Envíe sus documentos con tranquilidad"
        description="Canal reservado para clientes. PDF, imágenes y Office hasta 15 MB. Tratamiento confidencial."
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-brand-700">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">Envío de documentación</span>
            </div>
            <SecureUploadForm />
          </div>
          <p className="text-xs text-text-muted text-center mt-6">
            ¿Prefiere contactar primero?{" "}
            <Link href="/contacto" className="text-brand-600 underline">Formulario de contacto</Link>
          </p>
        </div>
      </section>
    </>
  )
}
