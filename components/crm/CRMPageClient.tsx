"use client"

import { useState } from "react"
import { ViewToggle } from "@/components/ui/view-toggle"

export function CRMViewToggle({
  view,
  onChange,
}: {
  view: "pipeline" | "list"
  onChange: (view: "pipeline" | "list") => void
}) {
  return (
    <ViewToggle
      view={view === "pipeline" ? "kanban" : "list"}
      onChange={(v) => onChange(v === "kanban" ? "pipeline" : "list")}
      kanbanLabel="Embudo"
    />
  )
}

export function CRMPageClient({
  pipeline,
  list,
}: {
  pipeline: React.ReactNode
  list: React.ReactNode
}) {
  const [view, setView] = useState<"pipeline" | "list">("pipeline")

  return (
    <div className="space-y-6">
      <CRMViewToggle view={view} onChange={setView} />
      {view === "pipeline" ? pipeline : list}
    </div>
  )
}
