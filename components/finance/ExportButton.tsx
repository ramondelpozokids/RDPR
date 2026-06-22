"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type ExportType = "journal" | "accounts" | "ledger" | "ledgers" | "vat"

export function ExportButton({
  type,
  accountCode,
  label = "Exportar CSV",
  variant = "secondary" as const,
}: {
  type: ExportType
  accountCode?: string
  label?: string
  variant?: "default" | "secondary" | "outline" | "ghost"
}) {
  const params = new URLSearchParams({ type })
  if (accountCode) params.set("accountCode", accountCode)
  const href = `/api/finance/export?${params.toString()}`

  return (
    <Button variant={variant} size="sm" asChild>
      <a href={href} download>
        <Download size={14} />
        {label}
      </a>
    </Button>
  )
}
