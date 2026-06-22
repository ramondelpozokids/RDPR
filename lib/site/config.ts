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
export const SITE_TAGLINE = "Business Operating System"
export const CEO_NAME = "Ramón del Pozo Rott"
export const CEO_TITLE = "Fundador · Portfolio Ramón"
export const CONTACT_EMAIL = "info@ramondelpozorott.es"

export type SiteNavItem = {
  href: string
  label: string
  description?: string
}

export const SITE_NAV: SiteNavItem[] = [
  { href: "/", label: "Inicio", description: "Visión general de RDPR OS" },
  { href: "/plataforma", label: "Plataforma", description: "Cómo funciona el sistema" },
  { href: "/modulos", label: "Módulos", description: "Finanzas, CRM, proyectos y más" },
  { href: "/inteligencia", label: "Inteligencia IA", description: "RDPR Intelligence y asistente" },
  { href: "/precios", label: "Precios", description: "Planes Starter, Business y Enterprise" },
  { href: "/nosotros", label: "Nosotros", description: "Equipo y liderazgo" },
]

export const FOOTER_LINKS = {
  producto: [
    { href: "/plataforma", label: "Plataforma" },
    { href: "/modulos", label: "Módulos" },
    { href: "/inteligencia", label: "Inteligencia IA" },
    { href: "/precios", label: "Precios" },
  ],
  empresa: [
    { href: "/nosotros", label: "Sobre nosotros" },
    { href: "/nosotros#ceo", label: "Ramón del Pozo Rott" },
    { href: `mailto:${CONTACT_EMAIL}`, label: "Contacto" },
  ],
  acceso: [
    { href: "/login", label: "Iniciar sesión" },
    { href: "/register", label: "Solicitar demo" },
  ],
}
