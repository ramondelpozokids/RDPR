export type OcrStructured = {
  vendor?: string
  amount?: number
  date?: string
  vatRate?: number
  confidence: "low" | "medium"
  source: "filename" | "text"
}

export type OcrExtraction = {
  rawText: string
  structured: OcrStructured
}

const DATE_PATTERNS = [
  /(\d{4})-(\d{2})-(\d{2})/,
  /(\d{2})[./](\d{2})[./](\d{4})/,
]

const AMOUNT_PATTERN = /(\d{1,3}(?:[.\s]\d{3})*[.,]\d{2}|\d+[.,]\d{2})/

function parseAmount(raw: string): number | undefined {
  const normalized = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
  const n = parseFloat(normalized)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function parseDateFromName(name: string): string | undefined {
  for (const re of DATE_PATTERNS) {
    const m = name.match(re)
    if (!m) continue
    if (m[0].includes("-")) return m[0]
    const [, d, mo, y] = m
    return `${y}-${mo}-${d}`
  }
  return undefined
}

function vendorFromFilename(name: string): string | undefined {
  const base = name.replace(/\.[^.]+$/, "")
  const part = base.split(/[-_]/)[0]?.trim()
  if (!part || part.length < 2) return undefined
  if (/^\d+$/.test(part)) return undefined
  return part.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Extracción OCR v1: heurísticas sobre nombre de archivo y texto plano opcional. */
export function extractDocumentOcr(name: string, textContent?: string): OcrExtraction {
  const hints: string[] = [`Archivo: ${name}`]
  const structured: OcrStructured = { confidence: "low", source: "filename" }

  const vendor = vendorFromFilename(name)
  if (vendor) {
    structured.vendor = vendor
    hints.push(`Proveedor estimado: ${vendor}`)
  }

  const date = parseDateFromName(name)
  if (date) {
    structured.date = date
    hints.push(`Fecha detectada: ${date}`)
  }

  const amountMatch = name.match(AMOUNT_PATTERN)
  if (amountMatch) {
    const amount = parseAmount(amountMatch[1])
    if (amount) {
      structured.amount = amount
      hints.push(`Importe detectado: ${amount.toFixed(2)} €`)
      structured.confidence = "medium"
    }
  }

  if (textContent?.trim()) {
    structured.source = "text"
    hints.push("--- Contenido ---", textContent.slice(0, 4000))

    if (!structured.amount) {
      const m = textContent.match(/total[\s:]*(\d+[.,]\d{2})/i)
      if (m) {
        const amount = parseAmount(m[1])
        if (amount) structured.amount = amount
      }
    }
    if (!structured.date) {
      for (const re of DATE_PATTERNS) {
        const m = textContent.match(re)
        if (m) {
          structured.date = m[0].includes("-") ? m[0] : undefined
          break
        }
      }
    }
    if (structured.vendor || structured.amount || structured.date) {
      structured.confidence = "medium"
    }
  }

  return {
    rawText: hints.join("\n"),
    structured,
  }
}

export async function fetchTextContent(fileUrl: string, fileType: string): Promise<string | undefined> {
  if (!fileUrl.startsWith("http")) return undefined
  if (!fileType.startsWith("text/") && fileType !== "application/json") return undefined
  try {
    const res = await fetch(fileUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return undefined
    const text = await res.text()
    return text.slice(0, 8000)
  } catch {
    return undefined
  }
}
