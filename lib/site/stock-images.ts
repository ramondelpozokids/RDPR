/** Imágenes Unsplash — licencia Unsplash (uso gratuito). Una imagen distinta por sección del sitio. */
export type StockImageKey =
  | "heroAerial"
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
  id: string
  alt: string
}

export const STOCK: Record<StockImageKey, StockEntry> = {
  heroAerial: {
    id: "photo-1486406146926-c627a92ad1ab",
    alt: "Vista aérea de edificios de oficinas",
  },
  dashboardLaptop: {
    id: "photo-1460925895917-afdab827c52f",
    alt: "Análisis financiero en portátil",
  },
  teamMeeting: {
    id: "photo-1522071820081-009f0129c71c",
    alt: "Equipo profesional en reunión",
  },
  accountingDesk: {
    id: "photo-1554224155-6726b3ff858f",
    alt: "Documentos contables y calculadora",
  },
  handshakeDeal: {
    id: "photo-1560179707-f14e90ef3623",
    alt: "Acuerdo comercial entre profesionales",
  },
  projectPlanning: {
    id: "photo-1454165804606-c3d57bc86b40",
    alt: "Planificación de proyectos en escritorio",
  },
  secureDocuments: {
    id: "photo-1586281380349-6315fe033993",
    alt: "Archivo de documentación organizada",
  },
  dataAnalytics: {
    id: "photo-1551288049-bebda4e38f71",
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
    id: "photo-1677442136019-21780ecad995",
    alt: "Espacio de trabajo con tecnología e IA",
  },
}

export function stockUrl(key: StockImageKey, width = 1200): string {
  const { id } = STOCK[key]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}
