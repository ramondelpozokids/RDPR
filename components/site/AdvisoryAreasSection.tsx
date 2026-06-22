import { MarketingAccordionItem } from "@/components/site/MarketingAccordionItem"
import { StockImage } from "@/components/site/StockImage"
import { ADVISORY_AREAS } from "@/lib/site/gestoria-vision"
import type { StockImageKey } from "@/lib/site/stock-images"

type AdvisoryAreasSectionProps = {
  limit?: number
  showAllLink?: boolean
  /** IDs de áreas que se muestran como acordeón (p. ej. fiscal, contable, laboral). */
  accordionAreaIds?: string[]
  /** Imagen dentro del acordeón al expandir. */
  withAreaImages?: boolean
}

const AREA_IMAGES: Record<string, StockImageKey> = {
  fiscal: "fiscalArea",
  contable: "accountingArea",
  laboral: "laborArea",
}

export function AdvisoryAreasSection({
  limit,
  showAllLink = false,
  accordionAreaIds = [],
  withAreaImages = false,
}: AdvisoryAreasSectionProps) {
  const areas = limit ? ADVISORY_AREAS.slice(0, limit) : ADVISORY_AREAS
  const accordionSet = new Set(accordionAreaIds)

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

        <div className="space-y-3">
          {areas.map(({ id, icon: Icon, title, summary, items }) => {
            const isAccordion = accordionSet.has(id)
            const areaImage = AREA_IMAGES[id]

            if (isAccordion) {
              return (
                <MarketingAccordionItem
                  key={id}
                  title={title}
                  summary={summary}
                  icon={
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-brand-600" />
                    </div>
                  }
                >
                  {withAreaImages && areaImage && (
                    <StockImage
                      name={areaImage}
                      className="aspect-[21/9] rounded-xl border border-surface-border mb-4 overflow-hidden"
                      width={900}
                    />
                  )}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-brand-400 mt-0.5">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </MarketingAccordionItem>
              )
            }

            return (
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
            )
          })}
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
