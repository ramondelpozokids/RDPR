import type { LucideIcon } from "lucide-react"
import {
  Receipt,
  Calculator,
  Users,
  Building2,
  Scale,
  Wallet,
  FolderOpen,
  UserCircle,
  Globe,
  Brain,
  Landmark,
  FileText,
  ShieldCheck,
  PenLine,
} from "lucide-react"

export type RoadmapStatus = "live" | "beta" | "planned"

export type AdvisoryArea = {
  id: string
  icon: LucideIcon
  title: string
  summary: string
  items: string[]
}

/** Áreas que cubre una asesoría premium — visión de producto RDPR. */
export const ADVISORY_AREAS: AdvisoryArea[] = [
  {
    id: "fiscal",
    icon: Receipt,
    title: "Área fiscal",
    summary: "Impuestos, modelos AEAT, certificados y relación con la administración.",
    items: [
      "IVA (303, 390)",
      "IRPF (130, 131)",
      "Impuesto de Sociedades (200, 202)",
      "Retenciones (111, 190)",
      "Alquileres (115, 180)",
      "Operaciones con terceros (347)",
      "Intracomunitarias (349)",
      "Declaraciones informativas",
      "Certificados tributarios",
      "Notificaciones AEAT",
      "Apoderamientos",
    ],
  },
  {
    id: "contable",
    icon: Calculator,
    title: "Área contable",
    summary: "Contabilidad completa, cierre, tesorería y analítica.",
    items: [
      "Libro diario y mayor",
      "Balance de situación",
      "Pérdidas y ganancias",
      "Cierre contable",
      "Amortizaciones y provisiones",
      "Conciliación bancaria",
      "Tesorería y presupuestos",
      "Centros de coste",
      "Analítica",
    ],
  },
  {
    id: "laboral",
    icon: Users,
    title: "Área laboral",
    summary: "Contratación, nóminas, Seguridad Social y cumplimiento laboral.",
    items: [
      "Contratos, altas y bajas",
      "Nóminas y finiquitos",
      "Vacaciones y ausencias",
      "Incapacidades y convenios",
      "Seguros sociales",
      "Sistema RED y CRA",
      "Prevención de riesgos",
    ],
  },
  {
    id: "mercantil",
    icon: Building2,
    title: "Área mercantil",
    summary: "Constitución, modificaciones societarias y Registro Mercantil.",
    items: [
      "Constitución de sociedades",
      "Cambio de administradores",
      "Modificaciones estatutarias",
      "Ampliaciones de capital",
      "Actas y libros societarios",
      "Registro Mercantil",
      "Depósito de cuentas",
    ],
  },
  {
    id: "juridica",
    icon: Scale,
    title: "Área jurídica",
    summary: "Contratos, reclamaciones, RGPD y gestión documental legal.",
    items: [
      "Contratos y demandas",
      "Reclamaciones",
      "Protección de datos (RGPD)",
      "Compliance",
      "Firma electrónica",
      "Gestión documental jurídica",
    ],
  },
  {
    id: "financiera",
    icon: Wallet,
    title: "Área financiera",
    summary: "Facturación, cobros, banca y previsión de tesorería.",
    items: [
      "Facturación y eFactura",
      "Verifactu",
      "Cobros, pagos y remesas",
      "TPV y bancos",
      "Financiación",
      "Cash flow y forecasting",
    ],
  },
  {
    id: "documentacion",
    icon: FolderOpen,
    title: "Área de documentación",
    summary: "El archivo vivo de la asesoría: OCR, IA, firma y versionado.",
    items: [
      "Escrituras, contratos y facturas",
      "Nóminas, modelos y certificados",
      "Poderes y actas",
      "OCR e IA documental",
      "Firma digital",
      "Versionado y búsqueda inteligente",
    ],
  },
  {
    id: "clientes",
    icon: UserCircle,
    title: "Área de clientes",
    summary: "Expediente 360° por cliente: fiscal, laboral, documental y operativo.",
    items: [
      "Datos fiscales y empresas asociadas",
      "Administradores y trabajadores",
      "Expedientes e incidencias",
      "Facturas, impuestos y tareas",
      "Documentación centralizada",
    ],
  },
  {
    id: "portal",
    icon: Globe,
    title: "Portal del cliente",
    summary: "El cliente entra, consulta y colabora sin llamadas ni emails perdidos.",
    items: [
      "Consulta de impuestos y nóminas",
      "Descarga y subida de documentos",
      "Firma de documentos",
      "Mensajería con la asesoría",
      "Consultas con IA",
    ],
  },
  {
    id: "ia",
    icon: Brain,
    title: "IA para asesorías",
    summary: "Respuestas en lenguaje natural con datos reales de cada empresa.",
    items: [
      "¿Cuánto IVA voy a pagar este trimestre?",
      "¿Qué facturas me faltan?",
      "¿Qué trabajadores tienen vacaciones pendientes?",
      "¿Cuál es mi margen este año?",
      "¿Qué gastos son deducibles?",
    ],
  },
]

export type ProductModule = {
  slug: string
  icon: LucideIcon
  name: string
  tagline: string
  status: RoadmapStatus
  highlights: string[]
}

/** Módulos premium del ecosistema RDPR — alineados con gestoría + ERP + IA. */
export const RDPR_PRODUCT_MODULES: ProductModule[] = [
  {
    slug: "accounting",
    icon: Calculator,
    name: "RDPR Accounting",
    tagline: "Contabilidad PGC, diario, mayor e informes.",
    status: "live",
    highlights: ["Libro diario y mayor", "Balance y PyG", "Conciliación bancaria"],
  },
  {
    slug: "tax",
    icon: Receipt,
    name: "RDPR Tax",
    tagline: "Modelos AEAT, vencimientos y Tax Intelligence.",
    status: "live",
    highlights: ["303, 390, 111, 130, 200, 347", "Calendario fiscal", "Exportación orientativa"],
  },
  {
    slug: "finance",
    icon: Landmark,
    name: "RDPR Finance",
    tagline: "Facturación, eFactura, Verifactu y tesorería.",
    status: "live",
    highlights: ["Facturae", "Cobros y gastos", "Banca conectada"],
  },
  {
    slug: "crm",
    icon: Users,
    name: "RDPR CRM",
    tagline: "Clientes, embudo comercial y expedientes.",
    status: "live",
    highlights: ["Pipeline visual", "Datos fiscales del cliente", "Seguimiento comercial"],
  },
  {
    slug: "documents",
    icon: FolderOpen,
    name: "RDPR Documents",
    tagline: "Archivo digital, envío seguro y gestión documental.",
    status: "beta",
    highlights: ["Carpetas por expediente", "Etiquetas y búsqueda", "Roadmap: OCR e IA"],
  },
  {
    slug: "intelligence",
    icon: Brain,
    name: "RDPR Intelligence",
    tagline: "IA empresarial con datos reales.",
    status: "live",
    highlights: ["Consultas en lenguaje natural", "Fiscal y operaciones", "Gráficos y acciones"],
  },
  {
    slug: "banking",
    icon: Wallet,
    name: "RDPR Banking",
    tagline: "Bancos, conciliación y cash flow.",
    status: "live",
    highlights: ["Importación bancaria", "Conciliación", "Roadmap: forecasting"],
  },
  {
    slug: "payroll",
    icon: FileText,
    name: "RDPR Payroll",
    tagline: "Laboral, nóminas y Seguridad Social.",
    status: "beta",
    highlights: ["Plantilla y altas", "Nóminas mensuales", "Recibo PDF (MVP)"],
  },
  {
    slug: "legal",
    icon: Scale,
    name: "RDPR Legal",
    tagline: "Jurídico, contratos y cumplimiento.",
    status: "beta",
    highlights: ["Expedientes jurídicos", "Plantillas contractuales", "Roadmap: firma y RGPD"],
  },
  {
    slug: "portal",
    icon: Globe,
    name: "RDPR Portal",
    tagline: "Portal del cliente moderno.",
    status: "beta",
    highlights: ["Documentos", "Consultas", "Roadmap: firma y chat"],
  },
  {
    slug: "signature",
    icon: PenLine,
    name: "RDPR Signature",
    tagline: "Firma electrónica integrada.",
    status: "planned",
    highlights: ["Contratos", "Actas", "Flujos de aprobación"],
  },
  {
    slug: "compliance",
    icon: ShieldCheck,
    name: "RDPR Compliance",
    tagline: "RGPD, compliance y auditoría.",
    status: "planned",
    highlights: ["Registro de tratamientos", "Controles", "Evidencias"],
  },
]

export const RDPR_DIFFERENTIATION = {
  headline: "Gestoría + ERP + jurídico + IA en un solo ecosistema",
  body: "Odoo, Holded, Sage, A3, Cegid o Wolters Kluwer cubren piezas sueltas. RDPR apunta a integrar de forma nativa contabilidad, asesoría, documentación, laboral, jurídico e inteligencia artificial — el combo que casi ninguna plataforma une en un único sistema.",
  stack: ["Finance", "Tax", "Payroll", "Legal", "Documents", "AI"] as const,
}

export const STATUS_LABELS: Record<RoadmapStatus, string> = {
  live: "Disponible",
  beta: "En desarrollo",
  planned: "Roadmap",
}

export const STATUS_STYLES: Record<RoadmapStatus, string> = {
  live: "bg-emerald-50 text-emerald-800 border-emerald-200",
  beta: "bg-sky-50 text-sky-800 border-sky-200",
  planned: "bg-amber-50 text-amber-800 border-amber-200",
}
