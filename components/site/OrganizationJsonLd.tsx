import { SITE_URL } from "@/lib/site/seo"
import { LEGAL_COMPANY_NAME, CONTACT_EMAIL, SITE_NAME } from "@/lib/site/config"

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: LEGAL_COMPANY_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    description:
      "Asesoría contable, fiscal y software de gestión empresarial. Facturación electrónica y modelos AEAT.",
    areaServed: "ES",
    serviceType: ["Asesoría contable", "Asesoría fiscal", "Software de gestión"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
