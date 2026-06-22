import type { MetadataRoute } from "next"
import { SITE_NAV, FOOTER_LINKS } from "@/lib/site/config"
import { LEGAL_PAGES } from "@/lib/site/legal"
import { SITE_URL } from "@/lib/site/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages = [
    ...SITE_NAV,
    ...FOOTER_LINKS.producto.map((l) => ({ href: l.href, label: l.label })),
    ...FOOTER_LINKS.empresa.filter((l) => !l.href.startsWith("mailto:")),
    { href: "/plataforma", label: "Plataforma legacy" },
    { href: "/inteligencia", label: "Inteligencia" },
    { href: "/enviar-documentos", label: "Documentos" },
    ...LEGAL_PAGES.map((p) => ({ href: p.href, label: p.label })),
  ]

  const unique = [...new Map(pages.map((p) => [p.href, p])).values()]

  return unique.map(({ href }) => ({
    url: `${SITE_URL}${href === "/" ? "" : href}`,
    lastModified: now,
    changeFrequency: href.startsWith("/legal") ? ("monthly" as const) : ("weekly" as const),
    priority: href === "/" ? 1 : href.startsWith("/legal") ? 0.5 : 0.8,
  }))
}
