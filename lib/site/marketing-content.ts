import type { LucideIcon } from "lucide-react"
import {
  Calculator,
  Receipt,
  Users,
  FolderOpen,
  Shield,
  Brain,
  FileCheck2,
  Lock,
  Server,
  Eye,
} from "lucide-react"

export const SITE_KEYWORDS = [
  "gestoría online",
  "asesoría fiscal Madrid",
  "asesoría contable",
  "software gestoría",
  "facturación electrónica",
  "modelo 303",
  "modelo 390",
  "impuesto sociedades",
  "RDPR OS",
  "gestión empresarial",
  "contabilidad PGC",
  "Verifactu",
] as const

export type ServiceItem = {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

export const SERVICES: ServiceItem[] = [
  {
    icon: Calculator,
    title: "Asesoría contable y finanzas",
    description:
      "Contabilidad PGC, libro diario, mayor, conciliación bancaria e informes ejecutivos en tiempo real.",
    href: "/modulos#finance",
  },
  {
    icon: Receipt,
    title: "Asesoría fiscal",
    description:
      "Tax Intelligence con modelos 303, 390, 111, 130, 200 y 347. Vencimientos y alertas orientativas.",
    href: "/modelos-fiscales",
  },
  {
    icon: Users,
    title: "Gestión comercial",
    description: "Embudo de ventas, clientes, oportunidades y seguimiento comercial claro.",
    href: "/modulos#crm",
  },
  {
    icon: FileCheck2,
    title: "Facturación y eFactura",
    description: "Emisión de facturas, Facturae, cumplimiento Verifactu y Ley Antifraude.",
    href: "/modulos",
  },
  {
    icon: FolderOpen,
    title: "Documentación segura",
    description: "Envío cifrado de documentos para clientes y archivo digital protegido.",
    href: "/enviar-documentos",
  },
  {
    icon: Brain,
    title: "Inteligencia artificial",
    description: "Consultas en lenguaje natural sobre facturación, cobros, fiscal y operaciones.",
    href: "/inteligencia",
  },
]

export const SECURITY_LAYERS = [
  {
    icon: Lock,
    title: "Cifrado en tránsito",
    description: "HTTPS/TLS en toda la comunicación web y APIs.",
  },
  {
    icon: Shield,
    title: "Cifrado en reposo",
    description: "Documentos públicos cifrados con AES-256-GCM antes de almacenarse.",
  },
  {
    icon: Server,
    title: "Aislamiento multi-tenant",
    description: "Cada empresa opera en su propio espacio de datos aislado.",
  },
  {
    icon: Eye,
    title: "Control de acceso",
    description: "Autenticación, sesiones seguras y permisos por usuario y empresa.",
  },
] as const

export const PUBLIC_TAX_MODELS = [
  { code: "303", name: "IVA trimestral", desc: "Autoliquidación del IVA" },
  { code: "390", name: "Resumen IVA", desc: "Resumen anual de IVA" },
  { code: "111", name: "Retenciones", desc: "Retenciones e ingresos a cuenta" },
  { code: "130", name: "IRPF fraccionado", desc: "Pagos fraccionados autónomos" },
  { code: "200", name: "Impuesto Sociedades", desc: "Declaración anual IS" },
  { code: "347", name: "Operaciones terceros", desc: "Operaciones > 3.005 €" },
] as const
