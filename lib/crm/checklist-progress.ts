import type { ChecklistItem } from "@/lib/crm/checklist-sync"

export function getChecklistProgress(checklist: ChecklistItem[] | null | undefined) {
  const items = checklist ?? []
  const total = items.length
  const done = items.filter((i) => i.done).length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, percent }
}
