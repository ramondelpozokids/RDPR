import type { Metadata } from "next"
import { LegalDocument } from "@/components/site/LegalDocument"
import { COOKIES_SECTIONS } from "@/lib/site/legal"

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Información sobre cookies y tecnologías similares utilizadas en RDPR OS.",
}

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Política de cookies"
      subtitle="Detalle de las tecnologías de almacenamiento local, cookies técnicas, preferencias y cómo gestionar su consentimiento."
      sections={COOKIES_SECTIONS}
      currentHref="/legal/cookies"
    />
  )
}
