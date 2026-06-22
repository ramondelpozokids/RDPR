import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PUBLIC_TAX_MODELS } from "@/lib/site/marketing-content"

type TaxModelsShowcaseProps = {
  compact?: boolean
}

export function TaxModelsShowcase({ compact = false }: TaxModelsShowcaseProps) {
  return (
    <section className={compact ? "" : "py-16 px-4 sm:px-6 bg-white border-y border-surface-border"}>
      <div className={compact ? "" : "max-w-5xl mx-auto"}>
        {!compact && (
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Fiscal · AEAT</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Modelos fiscales integrados</h2>
            <p className="text-text-secondary leading-relaxed">
              Cálculos orientativos desde sus datos. Exportación y calendario de vencimientos.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PUBLIC_TAX_MODELS.map((m) => (
            <div
              key={m.code}
              className="rounded-xl border border-surface-border bg-surface-muted/30 p-4 text-center hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
            >
              <p className="text-2xl font-bold text-brand-600 tabular-nums">{m.code}</p>
              <p className="text-xs font-semibold text-text-primary mt-1">{m.name}</p>
              <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-3">{m.desc}</p>
              {m.status === "planned" && (
                <span className="inline-block mt-2 text-[10px] font-medium uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  Próximamente
                </span>
              )}
            </div>
          ))}
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
