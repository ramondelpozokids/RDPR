import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BRAND_TYPE_LABELS } from "@/lib/brands/catalog"
import type { BrandType } from "@prisma/client"

type BrandRow = {
  id: string
  name: string
  slug: string
  type: string
  tagline: string | null
  brandColor: string
}

export function BrandsSettings({
  legalName,
  companyName,
  brands,
}: {
  legalName: string | null
  companyName: string
  brands: BrandRow[]
}) {
  const displayLegal = legalName?.trim() || companyName
  const main = brands.filter((b) => b.type === "MAIN" || b.type === "PRODUCT")
  const standalone = brands.filter((b) => b.type === "STANDALONE")

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Razón social</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-semibold text-lg">{displayLegal}</p>
          <p className="text-muted-foreground text-xs">
            Una sola entidad legal para facturación, AEAT, eFactura e impuestos (modelos 303, 200, 347…).
            Todas las marcas comerciales operan bajo esta razón social.
          </p>
        </CardContent>
      </Card>

      {main.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">RDPR · productos y módulos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {main.map((b) => (
                <BrandRowItem key={b.id} brand={b} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {standalone.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marcas especializadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {standalone.map((b) => (
                <BrandRowItem key={b.id} brand={b} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {brands.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Sin marcas registradas. Ejecuta <code className="text-xs bg-muted px-1 rounded">npm run db:seed</code> para cargar el ecosistema RDPR.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BrandRowItem({ brand }: { brand: BrandRow }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: brand.brandColor }}
      >
        {brand.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{brand.name}</p>
        {brand.tagline && <p className="text-xs text-muted-foreground">{brand.tagline}</p>}
      </div>
      <Badge variant="muted" className="text-[10px] shrink-0">
        {BRAND_TYPE_LABELS[brand.type as BrandType] ?? brand.type}
      </Badge>
    </div>
  )
}
