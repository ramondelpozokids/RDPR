import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  ShoppingCart,
  BookOpen,
  BookMarked,
  List,
  Landmark,
  Link2,
  Receipt,
  BarChart3,
  Sparkles,
  Wallet,
  Tag,
  Briefcase,
} from "lucide-react"

export type FinanceNavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

export type FinanceNavGroup = {
  id: string
  label: string
  description: string
  items: FinanceNavItem[]
}

/** Estructura RDPR Finance — plataforma empresarial completa (no solo facturación). */
export const RDPR_FINANCE_GROUPS: FinanceNavGroup[] = [
  {
    id: "overview",
    label: "Visión general",
    description: "Panel ejecutivo financiero",
    items: [
      { href: "/dashboard/finance", label: "Resumen", icon: LayoutDashboard },
      { href: "/dashboard/finance/brands", label: "Por marca", icon: Tag },
      { href: "/dashboard/finance/dossier", label: "Dossier", icon: Briefcase },
    ],
  },
  {
    id: "billing",
    label: "Facturación",
    description: "Emisión, cobros y documentos comerciales",
    items: [
      { href: "/dashboard/finance/invoicing", label: "Facturas", icon: FileText },
      { href: "/dashboard/finance/efactura", label: "eFactura", icon: FileCheck2, badge: "España" },
      { href: "/dashboard/finance/aeat", label: "Presentación AEAT", icon: Receipt, badge: "Beta" },
    ],
  },
  {
    id: "accounting",
    label: "Contabilidad",
    description: "PGC español y libros registro",
    items: [
      { href: "/dashboard/finance/expenses", label: "Gastos", icon: ShoppingCart },
      { href: "/dashboard/finance/journal", label: "Libro diario", icon: BookOpen },
      { href: "/dashboard/finance/ledger", label: "Libro mayor", icon: BookMarked },
      { href: "/dashboard/finance/accounts", label: "Plan contable", icon: List },
    ],
  },
  {
    id: "treasury",
    label: "Bancos y tesorería",
    description: "Movimientos, conciliación y flujo de caja",
    items: [
      { href: "/dashboard/finance/banking", label: "Banca", icon: Landmark },
      { href: "/dashboard/finance/reconciliation", label: "Conciliación", icon: Link2 },
    ],
  },
  {
    id: "tax",
    label: "Impuestos",
    description: "RDPR Tax Intelligence · modelos AEAT",
    items: [
      { href: "/dashboard/finance/taxes", label: "Tax Intelligence", icon: Receipt, badge: "España" },
    ],
  },
  {
    id: "intelligence",
    label: "IA financiera",
    description: "Alertas, proyecciones e insights",
    items: [
      { href: "/dashboard/finance/reports", label: "Informes", icon: BarChart3 },
      { href: "/dashboard/intelligence", label: "Intelligence", icon: Sparkles },
    ],
  },
]

export const RDPR_FINANCE_TAGLINE = "RDPR Finance"
export const RDPR_EFACTURA_TAGLINE = "Facturación electrónica · Verifactu · Ley Antifraude"

export const EFactura_CAPABILITIES = [
  "Facturación electrónica en formatos Facturae, UBL y PDF",
  "Huella de cumplimiento (Verifactu / Ley Antifraude) v1",
  "Envío por email y registro de envío electrónico",
  "Asientos contables automáticos al emitir y cobrar",
  "Conciliación bancaria integrada",
  "Validación de NIF/CIF emisor y receptor",
  "IA para detección de errores e inconsistencias",
  "Presupuestos, albaranes y facturas recurrentes (roadmap)",
] as const

export const EFactura_ROADMAP = [
  { label: "Firma electrónica XAdES", status: "planned" as const },
  { label: "Recepción facturas proveedor", status: "planned" as const },
  { label: "Registro AEAT Verifactu", status: "active" as const },
  { label: "Facturas recurrentes", status: "planned" as const },
  { label: "Presupuestos y albaranes", status: "planned" as const },
  { label: "Modelos 303/390 automáticos", status: "active" as const },
] as const

export const FINANCE_MODULE_CARD = {
  title: "RDPR Finance",
  subtitle: "Plataforma financiera empresarial",
  pillars: [
    { name: "Facturación", desc: "Emisión, cobros, PDF y recordatorios" },
    { name: "eFactura", desc: "Facturae, cumplimiento Crea y Crece, Verifactu" },
    { name: "Contabilidad", desc: "PGC, diario, mayor y gastos" },
    { name: "Tesorería", desc: "Banca, conciliación y flujo de caja" },
    { name: "Impuestos", desc: "Tax Intelligence: 303, 390, 130, 111, 200, 347" },
    { name: "IA Financiera", desc: "Alertas, proyecciones e Intelligence" },
  ],
}
