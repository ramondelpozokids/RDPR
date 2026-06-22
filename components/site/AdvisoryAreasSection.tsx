import { ADVISORY_AREAS } from "@/lib/site/gestoria-vision"

type AdvisoryAreasSectionProps = {
  limit?: number
  showAllLink?: boolean
}

export function AdvisoryAreasSection({ limit, showAllLink = false }: AdvisoryAreasSectionProps) {
  const areas = limit ? ADVISORY_AREAS.slice(0, limit) : ADVISORY_AREAS

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Cobertura integral</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Más allá de la contabilidad
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Las asesorías más potentes gestionan prácticamente toda la vida administrativa de una empresa.
            RDPR OS está diseñado para ese nivel de exigencia.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {areas.map(({ id, icon: Icon, title, summary, items }) => (
            <article
              key={id}
              className="rounded-2xl border border-surface-border bg-white p-6 hover:border-brand-200 transition-colors"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{summary}</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {items.map((item) => (
                  <li key={item} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-brand-400 mt-0.5">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {showAllLink && limit && limit < ADVISORY_AREAS.length && (
          <p className="text-center text-sm text-text-muted mt-8">
            {ADVISORY_AREAS.length - limit} áreas más en la hoja de ruta del producto.
          </p>
        )}
      </div>
    </section>
  )
}
