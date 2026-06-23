import type { TaxEntityType, VatFilingPeriod } from "@prisma/client"

export type FiscalDeadline = {
  modelId: string
  label: string
  dueDate: Date
  periodLabel: string
}

type ProfileInput = {
  entityType: TaxEntityType
  vatFilingPeriod: VatFilingPeriod
}

/** Plazos AEAT habituales para gestorías (España). */
function quarterDeadline(year: number, quarter: number): Date {
  const map: Record<number, { month: number; day: number }> = {
    1: { month: 3, day: 20 },
    2: { month: 6, day: 20 },
    3: { month: 9, day: 20 },
    4: { month: 0, day: 30 },
  }
  const q = map[quarter]
  const y = quarter === 4 ? year + 1 : year
  return new Date(y, q.month, q.day, 23, 59, 59)
}

function monthDeadline(year: number, month: number): Date {
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 }
  return new Date(next.y, next.m, 20, 23, 59, 59)
}

export function getUpcomingFiscalDeadlines(
  profile: ProfileInput,
  from: Date = new Date(),
  horizonDays = 90
): FiscalDeadline[] {
  const deadlines: FiscalDeadline[] = []
  const horizon = new Date(from.getTime() + horizonDays * 86400000)
  const year = from.getFullYear()
  const month = from.getMonth()

  if (profile.vatFilingPeriod === "QUARTERLY") {
    const currentQ = Math.floor(month / 3) + 1
    for (let q = currentQ; q <= 4; q++) {
      const due = quarterDeadline(year, q)
      if (due >= from && due <= horizon) {
        deadlines.push({
          modelId: "303",
          label: "Modelo 303 — IVA trimestral",
          dueDate: due,
          periodLabel: `T${q} ${year}`,
        })
      }
    }
    if (profile.entityType === "AUTONOMO") {
      for (let q = currentQ; q <= 4; q++) {
        const due = quarterDeadline(year, q)
        if (due >= from && due <= horizon) {
          deadlines.push({
            modelId: "130",
            label: "Modelo 130 — IRPF trimestral",
            dueDate: due,
            periodLabel: `T${q} ${year}`,
          })
        }
      }
    }
  } else {
    for (let m = month; m <= month + 3; m++) {
      const y = year + Math.floor(m / 12)
      const mo = m % 12
      const due = monthDeadline(y, mo)
      if (due >= from && due <= horizon) {
        deadlines.push({
          modelId: "303",
          label: "Modelo 303 — IVA mensual",
          dueDate: due,
          periodLabel: `${mo + 1}/${y}`,
        })
      }
    }
  }

  if (profile.entityType !== "AUTONOMO") {
    const annual390 = new Date(year + 1, 0, 30, 23, 59, 59)
    if (annual390 >= from && annual390 <= horizon) {
      deadlines.push({
        modelId: "390",
        label: "Modelo 390 — Resumen anual IVA",
        dueDate: annual390,
        periodLabel: String(year),
      })
    }
  }

  return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
