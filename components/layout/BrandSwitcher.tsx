"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Check, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BrandOption } from "@/lib/brands/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BRAND_TYPE_LABELS } from "@/lib/brands/catalog"
import type { BrandType } from "@prisma/client"

type Props = {
  brands: BrandOption[]
  activeBrandId: string | null
  legalName: string
}

export default function BrandSwitcher({ brands, activeBrandId, legalName }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (brands.length === 0) return null

  const active = brands.find((b) => b.id === activeBrandId) ?? brands[0]
  const mainBrands = brands.filter((b) => b.type === "MAIN" || b.type === "PRODUCT")
  const standalone = brands.filter((b) => b.type === "STANDALONE")

  function switchBrand(brandId: string) {
    if (brandId === activeBrandId) return
    startTransition(async () => {
      await fetch("/api/brands/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      })
      router.refresh()
    })
  }

  function renderGroup(label: string, items: BrandOption[]) {
    if (items.length === 0) return null
    return (
      <>
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest">{label}</DropdownMenuLabel>
        {items.map((brand) => {
          const selected = brand.id === active.id
          return (
            <DropdownMenuItem
              key={brand.id}
              onClick={() => switchBrand(brand.id)}
              className={cn("gap-2.5 py-2 cursor-pointer", selected && "bg-accent")}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-[9px] font-bold"
                style={{ backgroundColor: brand.brandColor }}
              >
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{brand.name}</p>
                {brand.tagline && (
                  <p className="text-[10px] text-muted-foreground truncate">{brand.tagline}</p>
                )}
              </div>
              {selected && <Check size={14} className="text-primary shrink-0" />}
            </DropdownMenuItem>
          )
        })}
      </>
    )
  }

  return (
    <div className="px-3 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            disabled={pending}
            className={cn(
              "w-full h-auto justify-start gap-2 px-2.5 py-2 rounded-xl hover:bg-muted/60",
              pending && "opacity-60"
            )}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
              style={{ backgroundColor: active.brandColor }}
            >
              <Tag size={12} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] text-muted-foreground truncate">{legalName}</p>
              <p className="text-xs font-semibold truncate">{active.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {BRAND_TYPE_LABELS[active.type as BrandType] ?? "Marca"}
              </p>
            </div>
            <ChevronsUpDown size={13} className="text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-80 overflow-y-auto" align="start">
          {renderGroup("RDPR · productos", mainBrands.filter((b) => b.type === "PRODUCT" || b.type === "MAIN"))}
          {standalone.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {renderGroup("Marcas especializadas", standalone)}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
