import type { Metadata } from "next"
import { LegalDocument } from "@/components/site/LegalDocument"
import { PROTECCION_DATOS_SECTIONS } from "@/lib/site/legal"

export const metadata: Metadata = {
  title: "Protección de datos",
  description: "Compromiso RGPD, medidas de seguridad, roles responsable/encargado y ejercicio de derechos en RDPR OS.",
}

export default function ProteccionDatosPage() {
  return (
    <LegalDocument
      title="Protección de datos"
      subtitle="Marco de cumplimiento RGPD y LOPDGDD: seguridad multi-tenant, inteligencia artificial responsable y canal de ejercicio de derechos."
      sections={PROTECCION_DATOS_SECTIONS}
      currentHref="/legal/proteccion-datos"
    />
  )
}
