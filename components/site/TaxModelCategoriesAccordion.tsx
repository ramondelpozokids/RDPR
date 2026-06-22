"use client"

import { MarketingAccordionItem } from "@/components/site/MarketingAccordionItem"
import { TAX_MODEL_CATEGORIES, TAX_MODELS, type TaxModelCategory } from "@/lib/tax/models-registry"

export function TaxModelCategoriesAccordion() {
  const categories = Object.keys(TAX_MODEL_CATEGORIES) as TaxModelCategory[]

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const models = TAX_MODELS.filter((m) => m.category === cat)
        const { label, description } = TAX_MODEL_CATEGORIES[cat]
        return (
          <MarketingAccordionItem key={cat} title={label} summary={description}>
            <ul className="grid sm:grid-cols-2 gap-2">
              {models.map((m) => (
                <li key={m.id} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="font-bold text-brand-600 tabular-nums shrink-0">{m.code}</span>
                  <span>{m.description}</span>
                </li>
              ))}
            </ul>
          </MarketingAccordionItem>
        )
      })}
    </div>
  )
}
