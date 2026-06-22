import type { BrandType } from "@prisma/client"

export const DEFAULT_LEGAL_NAME = "RDPR Digital S.L."

export type BrandCatalogEntry = {
  slug: string
  name: string
  type: BrandType
  tagline: string
  brandColor: string
  sortOrder: number
  parentSlug?: string
}

/** Ecosistema RDPR — una razón social, múltiples marcas comerciales. */
export const RDPR_BRAND_CATALOG: BrandCatalogEntry[] = [
  {
    slug: "rdpr",
    name: "RDPR",
    type: "MAIN",
    tagline: "Marca principal · ecosistema empresarial",
    brandColor: "#6570f3",
    sortOrder: 0,
  },
  {
    slug: "rdpr-os",
    name: "RDPR OS",
    type: "PRODUCT",
    tagline: "Plataforma operativa unificada",
    brandColor: "#6570f3",
    sortOrder: 10,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-finance",
    name: "RDPR Finance",
    type: "PRODUCT",
    tagline: "Finanzas, facturación e impuestos",
    brandColor: "#6366f1",
    sortOrder: 11,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-accounting",
    name: "RDPR Accounting",
    type: "PRODUCT",
    tagline: "Contabilidad y PGC español",
    brandColor: "#4f46e5",
    sortOrder: 12,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-crm",
    name: "RDPR CRM",
    type: "PRODUCT",
    tagline: "Pipeline comercial y clientes",
    brandColor: "#8b5cf6",
    sortOrder: 13,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-projects",
    name: "RDPR Projects",
    type: "PRODUCT",
    tagline: "Proyectos, tareas y rentabilidad",
    brandColor: "#a855f7",
    sortOrder: 14,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-intelligence",
    name: "RDPR Intelligence",
    type: "PRODUCT",
    tagline: "IA financiera y consultas NL",
    brandColor: "#d946ef",
    sortOrder: 15,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-publishing",
    name: "RDPR Publishing",
    type: "PRODUCT",
    tagline: "Editorial y publicación digital",
    brandColor: "#ec4899",
    sortOrder: 16,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-commerce",
    name: "RDPR Commerce",
    type: "PRODUCT",
    tagline: "Comercio y ventas online",
    brandColor: "#f43f5e",
    sortOrder: 17,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-hr",
    name: "RDPR HR",
    type: "PRODUCT",
    tagline: "Recursos humanos y nóminas",
    brandColor: "#f97316",
    sortOrder: 18,
    parentSlug: "rdpr",
  },
  {
    slug: "rdpr-legal",
    name: "RDPR Legal",
    type: "PRODUCT",
    tagline: "Cumplimiento y documentación legal",
    brandColor: "#64748b",
    sortOrder: 19,
    parentSlug: "rdpr",
  },
  {
    slug: "editorial-rdpr",
    name: "Editorial RDPR",
    type: "PRODUCT",
    tagline: "Línea editorial del grupo",
    brandColor: "#d97706",
    sortOrder: 20,
    parentSlug: "rdpr",
  },
  {
    slug: "courtmanager-pro",
    name: "CourtManager Pro",
    type: "STANDALONE",
    tagline: "Gestión de clubes y pistas deportivas",
    brandColor: "#2563eb",
    sortOrder: 100,
  },
  {
    slug: "crearuna",
    name: "Creauna",
    type: "STANDALONE",
    tagline: "Creatividad y servicios profesionales",
    brandColor: "#059669",
    sortOrder: 101,
  },
  {
    slug: "bookia-publisher",
    name: "BOOKIA Publisher",
    type: "STANDALONE",
    tagline: "Editorial y publicación especializada",
    brandColor: "#7c3aed",
    sortOrder: 102,
  },
]

export const BRAND_TYPE_LABELS: Record<BrandType, string> = {
  MAIN: "Marca principal",
  PRODUCT: "Producto RDPR",
  STANDALONE: "Marca especializada",
}

export function getLegalDisplayName(company: { name: string; legalName?: string | null }) {
  return company.legalName?.trim() || company.name
}
