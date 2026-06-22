/** Rutas e imágenes del sitio público RDPR OS */
export const SITE_IMAGES = {
  logo: "/logo.webp",
  favicon: "/favicon.webp",
  hero: "/hero.webp",
  chatAssistant: "/chatassistent.webp",
  plataforma: "/plataforma.webp",
  presentacion: "/presentacion.webp",
  inteligencia: "/inteligencia.webp",
  precios: "/precios.webp",
  negocio: "/negocio.webp",
  business: "/business.webp",
  proyectos: "/projectos.webp",
  futurista: "/futurista.webp",
  ceoOficina: "/ramon-del-pozo-rott-oficina.webp",
  ceoEscalera: "/ramon-del-pozo-rott-escalera.webp",
} as const

export const SITE_NAME = "RDPR OS"
export const SITE_TAGLINE = "Gestión empresarial y asesoría digital"
export const LEGAL_COMPANY_NAME = "RDPR Digital S.L."
export const CEO_NAME = "Ramón del Pozo Rott"
export const CEO_TITLE = "Fundador y CEO · RDPR Digital S.L."
export const CONTACT_EMAIL = "info@ramondelpozorott.es"

export type SiteNavItem = {
  href: string
  label: string
  description?: string
}

export const SITE_NAV: SiteNavItem[] = [
  { href: "/", label: "Inicio", description: "Asesoría y gestión empresarial" },
  { href: "/servicios", label: "Servicios", description: "Contable, fiscal y documentos" },
  { href: "/modulos", label: "Plataforma", description: "Finanzas, CRM y proyectos" },
  { href: "/modelos-fiscales", label: "Modelos fiscales", description: "Catálogo AEAT completo" },
  { href: "/precios", label: "Precios", description: "Planes desde 49 €/mes" },
  { href: "/contacto", label: "Contacto", description: "Consulta gratuita" },
  { href: "/nosotros", label: "Nosotros", description: "CEO y fundador" },
]

export const FOOTER_LINKS = {
  producto: [
    { href: "/servicios", label: "Servicios" },
    { href: "/modulos", label: "Plataforma" },
    { href: "/modelos-fiscales", label: "Modelos fiscales" },
    { href: "/inteligencia", label: "Inteligencia IA" },
    { href: "/precios", label: "Precios" },
  ],
  empresa: [
    { href: "/nosotros", label: "Sobre nosotros" },
    { href: "/nosotros#ceo", label: "CEO y Fundador" },
    { href: "/contacto", label: "Contacto" },
    { href: "/enviar-documentos", label: "Enviar documentos" },
  ],
  legal: [
    { href: "/legal/aviso-legal", label: "Aviso legal" },
    { href: "/legal/privacidad", label: "Política de privacidad" },
    { href: "/legal/cookies", label: "Política de cookies" },
    { href: "/legal/proteccion-datos", label: "Protección de datos" },
    { href: "/legal/mapa-del-sitio", label: "Mapa del sitio" },
  ],
  acceso: [
    { href: "/login", label: "Iniciar sesión" },
    { href: "/register", label: "Solicitar acceso" },
  ],
}
