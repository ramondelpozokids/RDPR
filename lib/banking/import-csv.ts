/** Parsea CSV bancario simple (fecha, descripción, importe). */
export type ParsedBankRow = {
  date: Date
  description: string
  amount: number
  reference?: string
}

export function parseBankCsv(text: string): ParsedBankRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const rows: ParsedBankRow[] = []
  const startIdx = lines[0].toLowerCase().includes("fecha") ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i])
    if (parts.length < 3) continue

    const date = parseDate(parts[0])
    if (!date) continue

    const amount = parseAmount(parts[parts.length - 1])
    if (amount === null) continue

    const description = parts.slice(1, parts.length - 1).join(" ").trim() || parts[1]?.trim() || "Movimiento"
    const reference = parts.length > 3 ? parts[parts.length - 2] : undefined

    rows.push({ date, description, amount, reference })
  }

  return rows
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if ((ch === "," || ch === ";") && !inQuotes) {
      result.push(current.trim())
      current = ""
      continue
    }
    current += ch
  }
  result.push(current.trim())
  return result
}

function parseDate(raw: string): Date | null {
  const s = raw.trim().replace(/"/g, "")
  // dd/mm/yyyy or yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (m) {
    const day = parseInt(m[1], 10)
    const month = parseInt(m[2], 10) - 1
    let year = parseInt(m[3], 10)
    if (year < 100) year += 2000
    return new Date(year, month, day)
  }
  return null
}

function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/"/g, "").replace(/\s/g, "")
  s = s.replace(/€|EUR/gi, "")
  const negative = s.startsWith("-") || s.includes("(")
  s = s.replace(/[()]/g, "").replace("-", "")
  // European: 1.234,56 → 1234.56
  if (/\d,\d{2}$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".")
  } else {
    s = s.replace(/,/g, "")
  }
  const n = parseFloat(s)
  if (isNaN(n)) return null
  return negative ? -Math.abs(n) : n
}
