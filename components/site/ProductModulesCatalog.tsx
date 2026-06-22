import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  RDPR_PRODUCT_MODULES,
  RDPR_DIFFERENTIATION,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/site/gestoria-vision"

type ProductModulesCatalogProps = {
  compact?: boolean
}

export function ProductModulesCatalog({ compact = false }: ProductModulesCatalogProps) {
  return (
    <section className={compact ? "" : "py-16 px-4 sm:px-6 bg-surface-muted/30 border-y border-surface-border"}>
      <div className={compact ? "" : "max-w-5xl mx-auto"}>
        {!compact && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Ecosistema RDPR</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Módulos de una asesoría premium</h2>
            <p className="text-text-secondary leading-relaxed">{RDPR_DIFFERENTIATION.body}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {RDPR_DIFFERENTIATION.stack.map((pill) => (
            <span
              key={pill}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500 text-white"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RDPR_PRODUCT_MODULES.map(({ slug, icon: Icon, name, tagline, status, highlights }) => (
            <article
              key={slug}
              className="rounded-2xl border border-surface-border bg-white p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_STYLES[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <h3 className="font-bold mb-1">{name}</h3>
              <p className="text-sm text-text-muted mb-3">{tagline}</p>
              <ul className="space-y-1 flex-1">
                {highlights.map((h) => (
                  <li key={h} className="text-xs text-text-secondary">· {h}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {!compact && (
          <div className="text-center mt-10">
            <Link href="/contacto" className="btn-primary inline-flex text-sm">
              Hablar del roadmap
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
