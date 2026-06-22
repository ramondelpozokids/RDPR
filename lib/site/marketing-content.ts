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
  KeyRound,
  FileLock2,
} from "lucide-react"
import { TAX_MODELS } from "@/lib/tax/models-registry"

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
    title: "Asesoría contable",
    description:
      "Libro diario, mayor, balance, PyG, conciliación, tesorería y cierre contable.",
    href: "/modulos#finance",
  },
  {
    icon: Receipt,
    title: "Asesoría fiscal",
    description:
      "Catálogo AEAT completo: IVA, IRPF, Sociedades, retenciones, alquileres e intracomunitario.",
    href: "/modelos-fiscales",
  },
  {
    icon: Users,
    title: "Gestión de clientes",
    description: "Expediente 360°: fiscal, facturas, tareas, incidencias y documentación.",
    href: "/modulos#crm",
  },
  {
    icon: FileCheck2,
    title: "Facturación y eFactura",
    description: "Emisión de facturas, Facturae, Verifactu y cumplimiento normativo.",
    href: "/modulos",
  },
  {
    icon: FolderOpen,
    title: "Documentación",
    description: "Archivo digital, envío seguro y portal del cliente.",
    href: "/enviar-documentos",
  },
  {
    icon: Brain,
    title: "Inteligencia artificial",
    description: "Consultas inteligentes sobre su actividad empresarial.",
    href: "/inteligencia",
  },
]

export const SECURITY_LAYERS = [
  {
    icon: Lock,
    title: "Capa 1 · Transporte",
    description: "Conexión cifrada HTTPS y cabeceras de seguridad en cada respuesta.",
  },
  {
    icon: KeyRound,
    title: "Capa 2 · Acceso",
    description: "Área privada con autenticación; cada usuario solo ve su empresa y expedientes.",
  },
  {
    icon: FileLock2,
    title: "Capa 3 · Documentos",
    description: "Documentación sensible con cifrado y controles de acceso por rol.",
  },
  {
    icon: Shield,
    title: "Capa 4 · Anti-copia",
    description: "Disuasión en el sitio público: bloqueo de inspección, copia y arrastre no autorizados.",
  },
] as const

/** Catálogo completo de modelos AEAT visibles en marketing (mismo listado que la plataforma). */
export const PUBLIC_TAX_MODELS = TAX_MODELS.map((m) => ({
  code: m.code,
  name: m.name.replace(/^Modelo /, ""),
  desc: m.description,
  status: m.status as "active" | "preview" | "planned",
}))
