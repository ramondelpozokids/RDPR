import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageHeader } from "@/components/site/MarketingPageHeader"
import { SecureUploadForm } from "@/components/site/SecureUploadForm"
import { SecurityLayers } from "@/components/site/SecurityLayers"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Enviar documentos cifrados",
  description: "Portal seguro para enviar documentación confidencial a RDPR Digital S.L. Cifrado AES-256-GCM.",
  keywords: ["envío documentos seguro", "documentación cifrada", "portal cliente gestoría"],
}

export default function EnviarDocumentosPage() {
  return (
    <>
      <MarketingPageHeader
        eyebrow="Documentación segura"
        title="Envíe sus documentos de forma cifrada"
        description="Portal funcional para clientes. Sus archivos se cifran antes de almacenarse. PDF, imágenes y Office hasta 15 MB."
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-brand-700">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">Canal cifrado de documentación</span>
            </div>
            <SecureUploadForm />
          </div>
          <p className="text-xs text-text-muted text-center mt-6">
            ¿Prefiere contactar primero?{" "}
            <Link href="/contacto" className="text-brand-600 underline">Formulario de contacto</Link>
          </p>
        </div>
      </section>

      <SecurityLayers />
    </>
  )
}
