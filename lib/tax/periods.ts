export type TaxPeriod = {
  year: number
  quarter?: 1 | 2 | 3 | 4
  month?: number
  label: string
  start: Date
  end: Date
}

export function quarterOf(date: Date): 1 | 2 | 3 | 4 {
  return (Math.floor(date.getMonth() / 3) + 1) as 1 | 2 | 3 | 4
}

export function quarterStart(year: number, quarter: 1 | 2 | 3 | 4): Date {
  return new Date(year, (quarter - 1) * 3, 1)
}

export function quarterEnd(year: number, quarter: 1 | 2 | 3 | 4): Date {
  const month = quarter * 3
  return new Date(year, month, 0, 23, 59, 59, 999)
}

export function yearStart(year: number): Date {
  return new Date(year, 0, 1)
}

export function yearEnd(year: number): Date {
  return new Date(year, 11, 31, 23, 59, 59, 999)
}

export function getCurrentQuarterPeriod(year = new Date().getFullYear()): TaxPeriod {
  const q = quarterOf(new Date())
  const labels = ["Ene–Mar", "Abr–Jun", "Jul–Sep", "Oct–Dic"]
  return {
    year,
    quarter: q,
    label: `${labels[q - 1]} ${year}`,
    start: quarterStart(year, q),
    end: quarterEnd(year, q),
  }
}

export function getQuarterPeriod(year: number, quarter: 1 | 2 | 3 | 4): TaxPeriod {
  const labels = ["Ene–Mar", "Abr–Jun", "Jul–Sep", "Oct–Dic"]
  return {
    year,
    quarter,
    label: `${labels[quarter - 1]} ${year}`,
    start: quarterStart(year, quarter),
    end: quarterEnd(year, quarter),
  }
}

export function getYearPeriod(year: number): TaxPeriod {
  return {
    year,
    label: `Ejercicio ${year}`,
    start: yearStart(year),
    end: yearEnd(year),
  }
}

export function parsePeriodParam(
  period: string | null | undefined,
  defaultYear = new Date().getFullYear()
): TaxPeriod {
  if (!period || period === "current") return getCurrentQuarterPeriod(defaultYear)
  if (/^\d{4}$/.test(period)) return getYearPeriod(Number(period))
  const qMatch = period.match(/^(\d{4})-Q([1-4])$/)
  if (qMatch) {
    return getQuarterPeriod(Number(qMatch[1]), Number(qMatch[2]) as 1 | 2 | 3 | 4)
  }
  return getCurrentQuarterPeriod(defaultYear)
}
