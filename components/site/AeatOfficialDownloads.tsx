"use client"

import { useMemo, useState } from "react"
import { ExternalLink, Search } from "lucide-react"
import { AEAT_MODELS_HUB, AEAT_OFFICIAL_MODELS } from "@/lib/site/aeat-official"

export function AeatOfficialDownloads() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return AEAT_OFFICIAL_MODELS
    return AEAT_OFFICIAL_MODELS.filter(
      (m) =>
        m.code.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <section className="py-16 px-4 sm:px-6 bg-surface-muted/40 border-y border-surface-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Modelos oficiales AEAT</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Acceso público al catálogo de la Agencia Tributaria. Cada enlace abre la ficha oficial en la Sede
            electrónica, donde puede consultar instrucciones, presentar declaraciones y descargar documentación
            habilitada por la AEAT.
          </p>
          <a
            href={AEAT_MODELS_HUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline mt-4"
          >
            Índice completo en la Sede AEAT
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Buscar por número o descripción (p. ej. 303, IVA, IRPF…)"
            className="input w-full pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className="text-center text-xs text-text-muted mb-4">
          {filtered.length} modelo{filtered.length === 1 ? "" : "s"} · Fuente: Agencia Tributaria
        </p>

        <ul className="grid sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((m) => (
            <li key={`${m.code}-${m.url}`}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl border border-surface-border bg-white hover:border-brand-200 hover:bg-brand-50/30 transition-colors group"
              >
                <span className="font-bold text-brand-600 tabular-nums shrink-0 min-w-[2.5rem]">
                  {m.code}
                </span>
                <span className="text-sm text-text-secondary leading-snug group-hover:text-text-primary">
                  {m.description}
                </span>
                <ExternalLink size={14} className="text-text-muted shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
