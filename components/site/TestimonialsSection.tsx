import { Star } from "lucide-react"

/** Reseñas genéricas — sin nombres de clientes ni datos confidenciales. */
const REVIEWS = [
  {
    quote: "Respuesta rápida y trato cercano. La documentación queda ordenada y localizable.",
    role: "Autónomo · Madrid",
    rating: 5,
  },
  {
    quote: "Nos ayudaron a tener los modelos fiscales bajo control sin depender de hojas sueltas.",
    role: "Pyme · servicios profesionales",
    rating: 5,
  },
  {
    quote: "Plataforma clara para facturación y seguimiento. El equipo resuelve dudas al momento.",
    role: "Empresa en crecimiento",
    rating: 5,
  },
] as const

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-surface-muted/40 border-y border-surface-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Opiniones</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Lo que valoran nuestros clientes</h2>
          <p className="text-text-secondary leading-relaxed">
            Experiencias reales de empresas y autónomos que confían en nuestra asesoría digital.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {REVIEWS.map(({ quote, role, rating }) => (
            <blockquote
              key={quote}
              className="rounded-2xl border border-surface-border bg-white p-6 flex flex-col shadow-sm"
            >
              <div className="flex gap-0.5 mb-4" aria-label={`${rating} de 5 estrellas`}>
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
              <footer className="text-xs text-text-muted mt-4 pt-4 border-t border-surface-border">{role}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
