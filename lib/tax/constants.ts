/** Umbral modelo 347 — operaciones con terceros (€). */
export const MODEL_347_THRESHOLD = 3005.06

/** Tipo impositivo general IS (orientativo V1). */
export const DEFAULT_CORPORATE_TAX_RATE = 0.25

/** Pagos fraccionados IS — modelo 202 (orientativo V1). */
export const DEFAULT_CORPORATE_FRACTIONAL_RATE = 0.18

/** Pagos fraccionados IRPF estimación directa (orientativo). */
export const DEFAULT_IRPF_FRACTIONAL_RATE = 0.2

/** Retención profesionales por defecto si no se indica en factura. */
export const DEFAULT_PROFESSIONAL_WITHHOLDING_RATE = 0.15

/** Retención arrendamientos urbanos (modelo 115) — orientativo V1. */
export const DEFAULT_RENTAL_WITHHOLDING_RATE = 0.19

export const MODEL_347_OPERATION_TYPES = {
  PURCHASE: "B",
  SALE: "A",
} as const
