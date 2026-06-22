export const SITE_URL = "https://rdpr-uzun.vercel.app"

export const DEFAULT_OG = {
  type: "website" as const,
  locale: "es_ES",
  siteName: "RDPR OS",
  url: SITE_URL,
}

export const DEFAULT_TWITTER = {
  card: "summary_large_image" as const,
  title: "RDPR OS — Gestión empresarial y asesoría digital",
  description:
    "Asesoría contable, fiscal y software de gestión para empresas. Facturación, modelos AEAT e IA integrada.",
}
