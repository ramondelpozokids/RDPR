"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CompanyOption } from "@/lib/company/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const [pending, startTransition] = useTransition()

  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0]
  if (!active) return null

  function switchCompany(companyId: string) {
    if (companyId === activeCompanyId) return
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
    <div className="px-3 mb-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={pending}
            className={cn(
              "w-full h-auto justify-start gap-2.5 px-2.5 py-2 rounded-xl bg-muted/40 hover:bg-muted",
              pending && "opacity-60"
            )}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: active.brandColor ?? "#6570f3" }}
            >
              {active.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              {organizationName && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest truncate">
                  {organizationName}
                </p>
              )}
              <p className="text-xs font-semibold text-foreground truncate">{active.name}</p>
              <p className="text-[10px] text-muted-foreground">Cambiar empresa</p>
            </div>
            <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest">
            Empresas del grupo
          </DropdownMenuLabel>
          {companies.map((company) => {
            const selected = company.id === activeCompanyId
            return (
              <DropdownMenuItem
                key={company.id}
                onClick={() => switchCompany(company.id)}
                className={cn("gap-2.5 py-2 cursor-pointer", selected && "bg-accent")}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
                  style={{ backgroundColor: company.brandColor ?? "#6570f3" }}
                >
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{company.name}</p>
                  {company.role === "ADMIN" && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Building2 size={9} /> Admin
                    </p>
                  )}
                </div>
                {selected && <Check size={14} className="text-primary shrink-0" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
