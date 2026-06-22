/** Imágenes — Unsplash o assets locales en /public (más fiables en producción). */
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

type StockEntry = {
  id?: string
  local?: string
  alt: string
}

export const STOCK: Record<StockImageKey, StockEntry> = {
  heroAerial: {
    id: "photo-1486406146926-c627a92ad1ab",
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
    id: "photo-1522071820081-009f0129c71c",
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
    id: "photo-1497366216548-37526070297c",
    alt: "Oficina moderna y luminosa",
  },
  consultationCall: {
    id: "photo-1600880292203-757bb62b4baf",
    alt: "Consultoría profesional por videollamada",
  },
  companyBuilding: {
    id: "photo-1486325217747-1999470798e8",
    alt: "Sede corporativa y entorno empresarial",
  },
  aiWorkspace: {
    local: "/futurista.webp",
    alt: "Espacio de trabajo con tecnología e IA",
  },
}

export function stockUrl(key: StockImageKey, width = 1200): string {
  const entry = STOCK[key]
  if (entry.local) return entry.local
  if (!entry.id) return "/hero.webp"
  return `https://images.unsplash.com/${entry.id}?auto=format&fit=crop&w=${width}&q=80`
}
