import type { MetadataRoute } from "next"
import { SITE_NAV, FOOTER_LINKS } from "@/lib/site/config"
import { LEGAL_PAGES } from "@/lib/site/legal"

const BASE = "https://rdpr-uzun.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages = [
    ...SITE_NAV,
    ...FOOTER_LINKS.producto.map((l) => ({ href: l.href, label: l.label })),
    ...FOOTER_LINKS.empresa.filter((l) => !l.href.startsWith("mailto:")),
    ...LEGAL_PAGES.map((p) => ({ href: p.href, label: p.label })),
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ]

  const unique = [...new Map(pages.map((p) => [p.href, p])).values()]

  return unique.map(({ href }) => ({
    url: `${BASE}${href === "/" ? "" : href}`,
    lastModified: now,
    changeFrequency: href.startsWith("/legal") ? "monthly" : "weekly",
    priority: href === "/" ? 1 : href.startsWith("/legal") ? 0.5 : 0.8,
  }))
}
