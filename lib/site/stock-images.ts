/** Imágenes locales en /public — fiables en producción (sin dependencia de Unsplash). */
export type StockImageKey =
  | "heroAerial"
  | "heroMadrid"
  | "dashboardLaptop"
  | "teamMeeting"
  | "accountingDesk"
  | "handshakeDeal"
  | "projectPlanning"
  | "secureDocuments"
  | "dataAnalytics"
  | "modernOffice"
  | "consultationCall"
  | "companyBuilding"
  | "aiWorkspace"
  | "fiscalArea"
  | "accountingArea"
  | "laborArea"
  | "modulesArea"
  | "taxBanner"
  | "pricingArea"
  | "contactHero"
  | "aboutHero"
  | "datosFiscales"

type StockEntry = {
  local: string
  alt: string
}

export const STOCK: Record<StockImageKey, StockEntry> = {
  heroAerial: {
    local: "/hero.webp",
    alt: "Vista aérea de edificios de oficinas",
  },
  heroMadrid: {
    local: "/hero.webp",
    alt: "Vista aérea de Madrid",
  },
  dashboardLaptop: {
    local: "/plataforma.webp",
    alt: "Panel de gestión financiera",
  },
  teamMeeting: {
    local: "/area-laboral.webp",
    alt: "Equipo profesional en reunión",
  },
  accountingDesk: {
    local: "/business.webp",
    alt: "Documentos contables y calculadora",
  },
  handshakeDeal: {
    local: "/negocio.webp",
    alt: "Acuerdo comercial entre profesionales",
  },
  projectPlanning: {
    local: "/projectos.webp",
    alt: "Planificación de proyectos en escritorio",
  },
  secureDocuments: {
    local: "/presentacion.webp",
    alt: "Archivo de documentación organizada",
  },
  dataAnalytics: {
    local: "/inteligencia.webp",
    alt: "Panel de analítica y métricas",
  },
  modernOffice: {
    local: "/contacto-hero.webp",
    alt: "Oficina moderna y luminosa",
  },
  consultationCall: {
    local: "/consultoria.webp",
    alt: "Consultoría profesional por videollamada",
  },
  companyBuilding: {
    local: "/business.webp",
    alt: "Entorno empresarial y gestión profesional",
  },
  aiWorkspace: {
    local: "/futurista.webp",
    alt: "Espacio de trabajo con tecnología e IA",
  },
  fiscalArea: {
    local: "/area-fiscal.webp",
    alt: "Documentación fiscal y gestión tributaria",
  },
  accountingArea: {
    local: "/area-contable.webp",
    alt: "Contabilidad y análisis financiero empresarial",
  },
  laborArea: {
    local: "/area-laboral.webp",
    alt: "Equipo profesional y gestión laboral",
  },
  modulesArea: {
    local: "/modules-banner.webp",
    alt: "Panel de gestión empresarial modular",
  },
  taxBanner: {
    local: "/tax-banner.webp",
    alt: "Planificación fiscal y modelos tributarios",
  },
  pricingArea: {
    local: "/pricing-banner.webp",
    alt: "Consultoría empresarial y planes de servicio",
  },
  contactHero: {
    local: "/contacto-hero.webp",
    alt: "Atención profesional y contacto con asesoría",
  },
  aboutHero: {
    local: "/nosotros-hero.webp",
    alt: "Equipo de consultoría y asesoría empresarial",
  },
  datosFiscales: {
    local: "/datos_fiscales.webp",
    alt: "Datos fiscales y gestión tributaria",
  },
}

export function stockUrl(key: StockImageKey, _width = 1200): string {
  return STOCK[key].local
}
