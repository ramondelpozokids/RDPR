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
  | "fiscalArea"
  | "accountingArea"
  | "laborArea"
  | "modulesArea"
  | "taxBanner"
  | "pricingArea"
  | "contactHero"
  | "aboutHero"

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
    local: "/business.webp",
    alt: "Entorno empresarial y gestión profesional",
  },
  aiWorkspace: {
    local: "/futurista.webp",
    alt: "Espacio de trabajo con tecnología e IA",
  },
  fiscalArea: {
    id: "photo-1554224155-6726b3ff858f",
    alt: "Documentación fiscal y gestión tributaria",
  },
  accountingArea: {
    id: "photo-1454165804606-c3d57bc86b40",
    alt: "Contabilidad y análisis financiero empresarial",
  },
  laborArea: {
    id: "photo-1521737711862-e3b38105c25b",
    alt: "Equipo profesional y gestión laboral",
  },
  modulesArea: {
    id: "photo-1460925895917-afdab827c52f",
    alt: "Panel de gestión empresarial modular",
  },
  taxBanner: {
    id: "photo-1563986768609-322da13575f3",
    alt: "Planificación fiscal y modelos tributarios",
  },
  pricingArea: {
    id: "photo-1556761175-b413da4baf72",
    alt: "Consultoría empresarial y planes de servicio",
  },
  contactHero: {
    id: "photo-1423666639041-f56000c27a9c",
    alt: "Atención profesional y contacto con asesoría",
  },
  aboutHero: {
    id: "photo-1600880292089-90a7e086ee0c",
    alt: "Equipo de consultoría y asesoría empresarial",
  },
}

export function stockUrl(key: StockImageKey, width = 1200): string {
  const entry = STOCK[key]
  if (entry.local) return entry.local
  if (!entry.id) return "/hero.webp"
  return `https://images.unsplash.com/${entry.id}?auto=format&fit=crop&w=${width}&q=80`
}
