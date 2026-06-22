import type { Metadata } from "next"
import { LegalDocument } from "@/components/site/LegalDocument"
import { PRIVACIDAD_SECTIONS } from "@/lib/site/legal"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Información sobre el tratamiento de datos personales en RDPR OS conforme al RGPD y LOPDGDD.",
}

export default function PrivacidadPage() {
  return (
    <LegalDocument
      title="Política de privacidad"
      subtitle="Transparencia total sobre qué datos recogemos, por qué, durante cuánto tiempo y cuáles son sus derechos como interesado."
      sections={PRIVACIDAD_SECTIONS}
      currentHref="/legal/privacidad"
    />
  )
}
