import type { AccountType } from "@prisma/client"

/** Plan contable PGC simplificado para pymes (cuentas esenciales). */
export const PGC_DEFAULT_ACCOUNTS: Array<{ code: string; name: string; type: AccountType }> = [
  { code: "400", name: "Proveedores", type: "LIABILITY" },
  { code: "572", name: "Bancos e instituciones de crédito c/c vista", type: "ASSET" },
  { code: "430", name: "Clientes", type: "ASSET" },
  { code: "477", name: "HP IVA repercutido", type: "LIABILITY" },
  { code: "472", name: "HP IVA soportado", type: "ASSET" },
  { code: "705", name: "Prestaciones de servicios", type: "INCOME" },
  { code: "700", name: "Ventas de mercaderías", type: "INCOME" },
  { code: "600", name: "Compras de mercaderías", type: "EXPENSE" },
  { code: "626", name: "Servicios bancarios y similares", type: "EXPENSE" },
  { code: "629", name: "Otros servicios", type: "EXPENSE" },
  { code: "100", name: "Capital social", type: "EQUITY" },
  { code: "129", name: "Resultado del ejercicio", type: "EQUITY" },
]

/** Cuentas usadas por asientos automáticos de facturas. */
export const ACCOUNT_CODES = {
  CLIENTES: "430",
  IVA_REPERCUTIDO: "477",
  BANCOS: "572",
  INGRESOS_SERVICIOS: "705",
  PROVEEDORES: "400",
  IVA_SOPORTADO: "472",
} as const

export const EXPENSE_CATEGORY_ACCOUNTS: Record<string, string> = {
  SERVICES: "629",
  SUPPLIES: "600",
  BANK_FEES: "626",
  OTHER: "629",
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  SERVICES: "Servicios",
  SUPPLIES: "Compras / material",
  BANK_FEES: "Comisiones bancarias",
  OTHER: "Otros gastos",
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ASSET: "Activo",
  LIABILITY: "Pasivo",
  EQUITY: "Patrimonio",
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
}
