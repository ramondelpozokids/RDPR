import catalog from "@/lib/site/aeat-official-models.json"

export const AEAT_MODELS_HUB =
  "https://sede.agenciatributaria.gob.es/Sede/presentar-consultar-declaraciones-modelo.html"

export type AeatOfficialModel = {
  code: string
  url: string
  description: string
}

/** Catálogo oficial AEAT (Sede electrónica) — enlaces a presentación y documentación por modelo. */
export const AEAT_OFFICIAL_MODELS = catalog as AeatOfficialModel[]

export function findAeatOfficialModel(code: string): AeatOfficialModel | undefined {
  const normalized = code.trim()
  return AEAT_OFFICIAL_MODELS.find((m) => m.code === normalized)
}
