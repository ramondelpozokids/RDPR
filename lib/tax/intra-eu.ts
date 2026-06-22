/** Códigos ISO de países UE con régimen IVA (excl. ES). */
export const EU_VAT_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "EL",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "SE",
])

export type IntraEuVat = {
  countryCode: string
  vatNumber: string
}

/** Detecta NIF-IVA intracomunitario (prefijo país UE distinto de ES). */
export function parseIntraEuVat(taxId: string | null | undefined): IntraEuVat | null {
  if (!taxId) return null
  const normalized = taxId.replace(/[\s.-]/g, "").toUpperCase()
  const match = normalized.match(/^([A-Z]{2})([A-Z0-9]+)$/)
  if (!match) return null
  const countryCode = match[1] === "EL" ? "GR" : match[1]
  if (countryCode === "ES" || !EU_VAT_COUNTRY_CODES.has(countryCode)) return null
  return { countryCode, vatNumber: normalized }
}

export const MODEL_349_OPERATION = {
  DELIVERY: "E",
  ACQUISITION: "A",
} as const
