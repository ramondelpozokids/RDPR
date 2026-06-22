"use client"

import Link from "next/link"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TaxExportButton({
  modelId,
  period,
  label = "Exportar CSV",
}: {
  modelId: string
  period?: string
  label?: string
}) {
  const params = new URLSearchParams({ model: modelId })
  if (period) params.set("period", period)
  const href = `/api/tax/export?${params.toString()}`

  return (
    <Button variant="secondary" size="sm" asChild>
      <a href={href} download>
        <Download size={14} />
        {label}
      </a>
    </Button>
  )
}
