import type { LucideIcon } from "lucide-react"
import {
  Receipt,
  FileSpreadsheet,
  Wallet,
  Users,
  Building2,
  Globe2,
  Home,
  Calculator,
} from "lucide-react"
import type { TaxEntityType } from "@prisma/client"

export type TaxModelCategory =
  | "iva"
  | "irpf"
  | "retenciones"
  | "sociedades"
  | "terceros"
  | "intracomunitario"
  | "alquileres"

export type TaxModelStatus = "active" | "preview" | "planned"

export type TaxModelDefinition = {
  id: string
  code: string
  name: string
  shortName: string
  description: string
  category: TaxModelCategory
  icon: LucideIcon
  status: TaxModelStatus
  /** Entidades a las que aplica */
  entities: TaxEntityType[]
  /** Periodicidad habitual */
  frequency: "mensual" | "trimestral" | "anual"
  /** V1 implementado con cálculo desde datos RDPR */
  v1: boolean
}

export const TAX_MODEL_CATEGORIES: Record<TaxModelCategory, { label: string; description: string }> = {
  iva: { label: "IVA", description: "Autoliquidación y resumen anual" },
  irpf: { label: "IRPF", description: "Pagos fraccionados y declaración renta" },
  retenciones: { label: "Retenciones", description: "Trabajadores, profesionales y resúmenes" },
  sociedades: { label: "Sociedades", description: "Impuesto de Sociedades y pagos fraccionados" },
  terceros: { label: "Operaciones con terceros", description: "Declaración informativa anual" },
  intracomunitario: { label: "Intracomunitario", description: "Operaciones UE y ROI" },
  alquileres: { label: "Alquileres", description: "Retenciones y resumen anual" },
}

/** Catálogo completo de modelos AEAT soportados o planificados. */
export const TAX_MODELS: TaxModelDefinition[] = [
  {
    id: "303",
    code: "303",
    name: "Modelo 303",
    shortName: "303",
    description: "Autoliquidación del IVA (trimestral o mensual)",
    category: "iva",
    icon: Receipt,
    status: "active",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "trimestral",
    v1: true,
  },
  {
    id: "390",
    code: "390",
    name: "Modelo 390",
    shortName: "390",
    description: "Resumen anual del IVA",
    category: "iva",
    icon: FileSpreadsheet,
    status: "active",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "anual",
    v1: true,
  },
  {
    id: "130",
    code: "130",
    name: "Modelo 130",
    shortName: "130",
    description: "Pagos fraccionados IRPF — estimación directa",
    category: "irpf",
    icon: Wallet,
    status: "active",
    entities: ["AUTONOMO"],
    frequency: "trimestral",
    v1: true,
  },
  {
    id: "131",
    code: "131",
    name: "Modelo 131",
    shortName: "131",
    description: "Pagos fraccionados IRPF — estimación objetiva (módulos)",
    category: "irpf",
    icon: Calculator,
    status: "planned",
    entities: ["AUTONOMO"],
    frequency: "trimestral",
    v1: false,
  },
  {
    id: "111",
    code: "111",
    name: "Modelo 111",
    shortName: "111",
    description: "Retenciones e ingresos a cuenta — trabajadores y profesionales",
    category: "retenciones",
    icon: Users,
    status: "active",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "trimestral",
    v1: true,
  },
  {
    id: "190",
    code: "190",
    name: "Modelo 190",
    shortName: "190",
    description: "Resumen anual del modelo 111",
    category: "retenciones",
    icon: FileSpreadsheet,
    status: "active",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "anual",
    v1: true,
  },
  {
    id: "115",
    code: "115",
    name: "Modelo 115",
    shortName: "115",
    description: "Retenciones por arrendamientos de inmuebles urbanos",
    category: "alquileres",
    icon: Home,
    status: "planned",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "trimestral",
    v1: false,
  },
  {
    id: "180",
    code: "180",
    name: "Modelo 180",
    shortName: "180",
    description: "Resumen anual del modelo 115",
    category: "alquileres",
    icon: FileSpreadsheet,
    status: "planned",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "anual",
    v1: false,
  },
  {
    id: "200",
    code: "200",
    name: "Modelo 200",
    shortName: "200",
    description: "Impuesto sobre Sociedades — declaración anual",
    category: "sociedades",
    icon: Building2,
    status: "active",
    entities: ["SL", "SA", "OTHER"],
    frequency: "anual",
    v1: true,
  },
  {
    id: "202",
    code: "202",
    name: "Modelo 202",
    shortName: "202",
    description: "Pagos fraccionados del Impuesto de Sociedades",
    category: "sociedades",
    icon: Wallet,
    status: "planned",
    entities: ["SL", "SA", "OTHER"],
    frequency: "trimestral",
    v1: false,
  },
  {
    id: "347",
    code: "347",
    name: "Modelo 347",
    shortName: "347",
    description: "Declaración anual de operaciones con terceros (> 3.005,06 €)",
    category: "terceros",
    icon: Users,
    status: "active",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "anual",
    v1: true,
  },
  {
    id: "349",
    code: "349",
    name: "Modelo 349",
    shortName: "349",
    description: "Operaciones intracomunitarias",
    category: "intracomunitario",
    icon: Globe2,
    status: "planned",
    entities: ["AUTONOMO", "SL", "SA", "OTHER"],
    frequency: "mensual",
    v1: false,
  },
]

export const V1_TAX_MODEL_IDS = TAX_MODELS.filter((m) => m.v1).map((m) => m.id)

export function getTaxModel(id: string): TaxModelDefinition | undefined {
  return TAX_MODELS.find((m) => m.id === id)
}

export function getModelsForEntity(entity: TaxEntityType): TaxModelDefinition[] {
  return TAX_MODELS.filter((m) => m.entities.includes(entity))
}

export function getActiveV1ModelsForEntity(entity: TaxEntityType): TaxModelDefinition[] {
  return getModelsForEntity(entity).filter((m) => m.v1 && m.status === "active")
}

export const RDPR_TAX_INTELLIGENCE_TAGLINE =
  "Modelos AEAT · IA fiscal · Verifactu · Cumplimiento España"

export const TAX_INTELLIGENCE_ROADMAP = [
  { label: "Presentación AEAT con certificado digital", status: "planned" as const },
  { label: "Modelos 115/180 alquileres", status: "planned" as const },
  { label: "Modelo 349 intracomunitario", status: "planned" as const },
  { label: "Modelo 131 módulos IRPF", status: "planned" as const },
  { label: "Modelo 202 pagos fraccionados IS", status: "planned" as const },
  { label: "Simulación fiscal avanzada con IA", status: "planned" as const },
] as const
