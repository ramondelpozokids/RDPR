import { getChecklistProgress } from "@/lib/crm/checklist-progress"
import type { ChecklistItem } from "@/lib/crm/checklist-sync"

export function ChecklistProgressBar({
  checklist,
}: {
  checklist: ChecklistItem[] | null | undefined
}) {
  const { done, total, percent } = getChecklistProgress(checklist)
  if (total === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-text-muted">
        <span>Progreso onboarding</span>
        <span>{done}/{total} ({percent}%)</span>
      </div>
      <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
