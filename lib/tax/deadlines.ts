import type { TaxEntityType } from "@prisma/client"
import { getTaxModel } from "@/lib/tax/models-registry"

export type TaxDeadline = {
  modelId: string
  modelName: string
  dueDate: Date
  periodLabel: string
  daysUntil: number
  urgency: "overdue" | "soon" | "upcoming"
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

/** Plazos orientativos AEAT (días 1–20 del mes siguiente al cierre, salvo anuales). */
export function getUpcomingDeadlines(
  entity: TaxEntityType,
  ref = new Date()
): TaxDeadline[] {
  const year = ref.getFullYear()
  const month = ref.getMonth()
  const deadlines: TaxDeadline[] = []

  const q = Math.floor(month / 3) + 1
  const qEndMonth = q * 3 - 1 // 0-indexed last month of quarter

  // Trimestrales: 1–20 del mes siguiente al trimestre
  for (const modelId of ["303", "111", "130"] as const) {
    const model = getTaxModel(modelId)
    if (!model || !model.entities.includes(entity) || !model.v1) continue

    const dueMonth = qEndMonth + 1
    const dueYear = dueMonth > 11 ? year + 1 : year
    const dueDate = new Date(dueYear, dueMonth % 12, 20)
    if (dueDate < ref) continue

    const daysUntil = daysBetween(ref, dueDate)
    deadlines.push({
      modelId,
      modelName: model.name,
      dueDate,
      periodLabel: `T${q} ${year}`,
      daysUntil,
      urgency: daysUntil < 0 ? "overdue" : daysUntil <= 7 ? "soon" : "upcoming",
    })
  }

  // Anuales: febrero del año siguiente (347, 390, 190, 200)
  for (const [modelId, dueMonth, dueDay] of [
    ["390", 1, 30],
    ["190", 1, 31],
    ["347", 2, 28],
    ["200", 7, 25],
  ] as const) {
    const model = getTaxModel(modelId)
    if (!model || !model.entities.includes(entity) || !model.v1) continue

    const dueDate = new Date(year + 1, dueMonth, dueDay)
    if (dueDate < ref) continue
    const daysUntil = daysBetween(ref, dueDate)
    deadlines.push({
      modelId,
      modelName: model.name,
      dueDate,
      periodLabel: `Ejercicio ${year}`,
      daysUntil,
      urgency: daysUntil <= 14 ? "soon" : "upcoming",
    })
  }

  return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
