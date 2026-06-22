"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CompanyOption } from "@/lib/company/context"

type Props = {
  companies: CompanyOption[]
  activeCompanyId: string
  organizationName?: string | null
}

export default function CompanySwitcher({
  companies,
  activeCompanyId,
  organizationName,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0]
  if (!active) return null

  async function switchCompany(companyId: string) {
    if (companyId === activeCompanyId) {
      setOpen(false)
      return
    }
    setOpen(false)
    startTransition(async () => {
      await fetch("/api/companies/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      })
      router.refresh()
    })
  }

  return (
    <div className="relative px-3 mb-3">
      {organizationName && (
        <p className="px-2 mb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest truncate">
          {organizationName}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border border-surface-border",
          "bg-surface-muted/40 hover:bg-surface-muted transition-colors text-left",
          pending && "opacity-60"
        )}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
          style={{ backgroundColor: active.brandColor ?? "#6570f3" }}
        >
          {active.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{active.name}</p>
          <p className="text-[10px] text-text-muted">Cambiar empresa</p>
        </div>
        <ChevronsUpDown size={14} className="text-text-muted shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white border border-surface-border rounded-xl shadow-modal py-1.5 max-h-64 overflow-y-auto animate-in">
            {companies.map((company) => {
              const selected = company.id === activeCompanyId
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => switchCompany(company.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-muted transition-colors",
                    selected && "bg-brand-50/50"
                  )}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
                    style={{ backgroundColor: company.brandColor ?? "#6570f3" }}
                  >
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{company.name}</p>
                    {company.role === "ADMIN" && (
                      <p className="text-[10px] text-text-muted flex items-center gap-1">
                        <Building2 size={9} /> Admin
                      </p>
                    )}
                  </div>
                  {selected && <Check size={14} className="text-brand-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
