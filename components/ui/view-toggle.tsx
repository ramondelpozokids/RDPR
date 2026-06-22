"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type View = "kanban" | "list"

export function ViewToggle({
  view,
  onChange,
  kanbanLabel = "Por fases",
}: {
  view: View
  onChange: (view: View) => void
  kanbanLabel?: string
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      <Button
        type="button"
        variant={view === "kanban" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 gap-1.5", view === "kanban" && "shadow-sm")}
        onClick={() => onChange("kanban")}
      >
        <LayoutGrid size={14} />
        {kanbanLabel}
      </Button>
      <Button
        type="button"
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 gap-1.5", view === "list" && "shadow-sm")}
        onClick={() => onChange("list")}
      >
        <List size={14} />
        Lista
      </Button>
    </div>
  )
}

export function KanbanListPageClient({
  kanban,
  list,
  kanbanLabel,
}: {
  kanban: React.ReactNode
  list: React.ReactNode
  kanbanLabel?: string
}) {
  const [view, setView] = useState<View>("kanban")

  return (
    <div className="space-y-6">
      <ViewToggle view={view} onChange={setView} kanbanLabel={kanbanLabel} />
      {view === "kanban" ? kanban : list}
    </div>
  )
}
