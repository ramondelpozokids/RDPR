import type { Metadata } from "next"
import { LegalDocument } from "@/components/site/LegalDocument"
import { AVISO_LEGAL_SECTIONS } from "@/lib/site/legal"

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Condiciones de uso, titularidad y responsabilidades del sitio web y plataforma RDPR OS.",
}

export default function AvisoLegalPage() {
  return (
    <LegalDocument
      title="Aviso legal"
      subtitle="Información legal sobre el titular del sitio, condiciones de acceso, propiedad intelectual y limitación de responsabilidad conforme a la LSSI-CE."
      sections={AVISO_LEGAL_SECTIONS}
      currentHref="/legal/aviso-legal"
    />
  )
}
