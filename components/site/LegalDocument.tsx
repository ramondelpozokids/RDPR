import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Shield } from "lucide-react"
import { LEGAL_ENTITY, LEGAL_PAGES, type LegalBlock } from "@/lib/site/legal"
import { cn } from "@/lib/utils"

type LegalDocumentProps = {
  title: string
  subtitle: string
  sections: LegalBlock[]
  currentHref: string
}

export function LegalDocument({ title, subtitle, sections, currentHref }: LegalDocumentProps) {
  return (
    <div className="min-h-full">
      {/* Hero legal premium */}
      <section className="relative overflow-hidden bg-[#0A0A0B] text-white border-b border-white/10">
        <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-brand-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-violet-500/15 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/10 border border-white/10 items-center justify-center shrink-0">
              <Shield size={22} className="text-brand-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 mb-3">
                Legal · Cumplimiento
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight mb-4">
                {title}
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl">{subtitle}</p>
              <div className="flex flex-wrap gap-4 mt-6 text-xs text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={12} />
                  Actualizado: {LEGAL_ENTITY.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={12} />
                  Versión {LEGAL_ENTITY.version}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16">
          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-4 px-3">
                En esta página
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 text-xs text-text-secondary hover:text-brand-600 hover:bg-brand-50/80 rounded-lg transition-colors leading-snug"
                >
                  {s.title.replace(/^\d+\.\s*/, "")}
                </a>
              ))}
              <div className="pt-6 mt-6 border-t border-surface-border space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3 px-3">
                  Otros documentos
                </p>
                {LEGAL_PAGES.filter((p) => p.href !== currentHref && p.href !== "/legal/mapa-del-sitio").map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block px-3 py-2 text-xs text-text-muted hover:text-text-primary rounded-lg transition-colors"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          {/* Content */}
          <article className="legal-prose min-w-0">
            <div className="rounded-2xl border border-surface-border bg-white p-6 sm:p-10 shadow-sm mb-10">
              <p className="text-sm text-text-secondary leading-relaxed">
                Documento informativo de <strong className="text-text-primary">{LEGAL_ENTITY.companyName}</strong> ({LEGAL_ENTITY.tradeName}).
                Si necesita aclaraciones, escríbanos a{" "}
                <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`} className="text-brand-600 hover:underline">
                  {LEGAL_ENTITY.privacyEmail}
                </a>
                .
              </p>
            </div>

            {sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className={cn(
                  "scroll-mt-24 mb-12 pb-12",
                  idx < sections.length - 1 && "border-b border-surface-border"
                )}
              >
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mb-5">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((para, i) => (
                    <p key={i} className="text-[15px] sm:text-base text-text-secondary leading-[1.75]">
                      {para}
                    </p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-5 space-y-2.5">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[15px] text-text-secondary leading-relaxed pl-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Related */}
            <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-violet-50/50 p-6 sm:p-8">
              <h3 className="font-semibold text-text-primary mb-4">Documentación relacionada</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {LEGAL_PAGES.filter((p) => p.href !== currentHref).map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block p-4 rounded-xl bg-white/80 border border-surface-border hover:border-brand-200 hover:shadow-sm transition-all"
                  >
                    <p className="font-medium text-sm text-text-primary">{p.label}</p>
                    <p className="text-xs text-text-muted mt-1">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
