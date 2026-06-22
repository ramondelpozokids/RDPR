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
              Cálculos orientativos desde sus datos reales. Exportación CSV y calendario de vencimientos.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PUBLIC_TAX_MODELS.map((m) => (
            <div
              key={m.code}
              className="rounded-xl border border-surface-border bg-surface-muted/30 p-4 text-center hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
            >
              <p className="text-2xl font-bold text-brand-600 tabular-nums">{m.code}</p>
              <p className="text-xs font-semibold mt-1">{m.name}</p>
              <p className="text-[11px] text-text-muted mt-1 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="text-center mt-8">
            <Link href="/modelos-fiscales" className="btn-secondary inline-flex text-sm">
              Ver todos los modelos
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
