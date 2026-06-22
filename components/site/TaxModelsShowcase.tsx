import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { PUBLIC_TAX_MODELS } from "@/lib/site/marketing-content"
import { findAeatOfficialModel } from "@/lib/site/aeat-official"

type TaxModelsShowcaseProps = {
  compact?: boolean
  linkToOfficial?: boolean
}

export function TaxModelsShowcase({ compact = false, linkToOfficial = false }: TaxModelsShowcaseProps) {
  return (
    <section className={compact ? "" : "py-16 px-4 sm:px-6 bg-white border-y border-surface-border"}>
      <div className={compact ? "" : "max-w-5xl mx-auto"}>
        {!compact && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Fiscal · AEAT</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Principales modelos fiscales</h2>
            <p className="text-text-secondary leading-relaxed">
              Referencia de los modelos más habituales en la actividad de asesorías y empresas en España.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PUBLIC_TAX_MODELS.map((m) => {
            const official = linkToOfficial ? findAeatOfficialModel(m.code) : undefined
            const inner = (
              <>
                <p className="text-2xl font-bold text-brand-600 tabular-nums">{m.code}</p>
                <p className="text-xs font-semibold text-text-primary mt-1">{m.name}</p>
                <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-3">{m.desc}</p>
                {linkToOfficial && official && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-brand-600">
                    AEAT oficial <ExternalLink size={10} />
                  </span>
                )}
              </>
            )

            if (official) {
              return (
                <a
                  key={m.code}
                  href={official.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-surface-border bg-surface-muted/30 p-4 text-center hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
                >
                  {inner}
                </a>
              )
            }

            return (
              <div
                key={m.code}
                className="rounded-xl border border-surface-border bg-surface-muted/30 p-4 text-center hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
              >
                {inner}
              </div>
            )
          })}
        </div>
        {!compact && (
          <div className="text-center mt-8">
            <Link href="/modelos-fiscales" className="btn-secondary inline-flex text-sm">
              Detalle de modelos
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
