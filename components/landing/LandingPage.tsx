import Link from "next/link"
import {
  ArrowRight, BarChart3, BookOpen, Brain,
  Building2, Check, Layers, LineChart,
  Shield, Sparkles, Users, Wallet, Zap,
} from "lucide-react"
import LandingNav from "./LandingNav"
import DashboardPreview from "./DashboardPreview"
import AIChatDemo from "./AIChatDemo"

const VALUE_PROPS = [
  "Todo tu ecosistema empresarial conectado.",
  "Menos herramientas. Más control.",
  "La inteligencia operativa para empresas modernas.",
  "Donde las decisiones se convierten en resultados.",
  "Ve el futuro de tu empresa antes de que ocurra.",
]

const MODULES = [
  {
    icon: Wallet,
    title: "Finanzas y contabilidad",
    desc: "Libro diario, IVA, conciliación bancaria e informes ejecutivos en tiempo real.",
    className: "md:col-span-2 md:row-span-2",
    accent: "from-brand-500/10 to-brand-600/5",
  },
  {
    icon: Users,
    title: "CRM comercial",
    desc: "Pipeline visual, oportunidades y seguimiento comercial.",
    className: "",
    accent: "from-violet-500/10 to-violet-600/5",
  },
  {
    icon: Layers,
    title: "Proyectos",
    desc: "Kanban, costes, rentabilidad y control de recursos.",
    className: "",
    accent: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: BookOpen,
    title: "Editorial",
    desc: "Autores, libros, regalías e ISBN para BOOKIA Publisher.",
    className: "",
    accent: "from-amber-500/10 to-amber-600/5",
  },
  {
    icon: Brain,
    title: "RDPR Intelligence",
    desc: "IA que consulta tu negocio y responde con datos reales.",
    className: "md:col-span-2",
    accent: "from-violet-500/10 to-brand-500/10",
  },
]

const PLANS = [
  {
    name: "Starter",
    tagline: "Para emprendedores",
    price: "49",
    features: ["1 empresa", "CRM y facturación", "Proyectos básicos", "1 usuario", "Soporte email"],
    cta: "Empezar",
    highlight: false,
  },
  {
    name: "Business",
    tagline: "Para empresas en crecimiento",
    price: "149",
    features: ["Hasta 10 usuarios", "Finanzas completas", "Informes avanzados", "Multi-equipo", "Soporte prioritario"],
    cta: "Solicitar demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    tagline: "Para grupos empresariales",
    price: "499",
    features: ["Multi-empresa", "Consolidación holding", "SSO y API", "Auditoría", "Account manager"],
    cta: "Contactar",
    highlight: false,
  },
  {
    name: "Intelligence",
    tagline: "Add-on IA avanzada",
    price: "99",
    suffix: "+",
    features: ["RDPR Intelligence", "Predicciones IA", "Clasificación contable", "Agentes autónomos", "RAG empresarial"],
    cta: "Añadir IA",
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#FAFAFA] text-text-primary overflow-x-hidden">
      <LandingNav />

      {/* Hero */}
      <section id="producto" className="landing-hero relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        <div className="landing-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-in">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1.5">
                <Sparkles size={12} />
                Business Operating System
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-text-primary">
                  RDPR OS
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-text-primary/90 leading-snug tracking-tight">
                  La plataforma inteligente para dirigir empresas, proyectos y finanzas desde un único lugar.
                </p>
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
                  Gestiona operaciones, contabilidad, proyectos, clientes y crecimiento empresarial con ayuda de inteligencia artificial avanzada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary justify-center py-3 px-6 text-base shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow">
                  Solicitar demostración
                  <ArrowRight size={18} />
                </Link>
                <Link href="/login" className="btn-secondary justify-center py-3 px-6 text-base">
                  Ver plataforma
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Sin tarjeta</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Multi-empresa</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> IA integrada</span>
              </div>
            </div>

            <div className="relative landing-float animate-in">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-transparent rounded-3xl blur-2xl" aria-hidden />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-surface-border bg-white py-8 px-4">
        <p className="text-center text-sm text-text-muted max-w-2xl mx-auto">
          Diseñado para empresarios que gestionan <strong className="text-text-secondary font-medium">operaciones, finanzas y crecimiento</strong> sin dispersarse en docenas de herramientas.
        </p>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              La contabilidad deja de ser una obligación.
              <span className="text-brand-600"> Se convierte en ventaja competitiva.</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Controla cada euro, cada proyecto y cada decisión desde una única plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Sin RDPR</p>
              <ul className="space-y-3 text-sm text-text-secondary">
                {["12 herramientas desconectadas", "Datos rotos entre equipos", "Sin visión financiera real", "Decisiones a ciegas"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/30 p-8 space-y-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Con RDPR OS</p>
              <ul className="space-y-3 text-sm text-text-primary">
                {["Una plataforma, todo conectado", "Multi-empresa desde un dashboard", "Finanzas + operaciones + IA", "Predicciones antes de que ocurra"].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-brand-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-surface-border">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {VALUE_PROPS.map(text => (
            <span
              key={text}
              className="text-sm font-medium text-text-secondary bg-surface-muted border border-surface-border rounded-full px-4 py-2"
            >
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Modules bento */}
      <section id="modulos" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Todo el negocio. Un solo sistema.
            </h2>
            <p className="text-text-secondary text-lg">
              Módulos diseñados para holdings, SaaS, editoriales y empresas de servicios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 auto-rows-fr">
            {MODULES.map(({ icon: Icon, title, desc, className, accent }) => (
              <div
                key={title}
                className={`group rounded-2xl border border-surface-border bg-white p-6 hover:shadow-lg hover:border-brand-200/60 transition-all duration-300 ${className}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Building2, label: "Multi-empresa", desc: "Portfolio Ramón, CourtManager, BOOKIA…" },
              { icon: Shield, label: "Datos aislados", desc: "Cada cliente, su propio tenant seguro" },
              { icon: Zap, label: "Rápido como Linear", desc: "Interfaz limpia, cero fricción" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-3 items-start p-4 rounded-xl bg-surface-muted/50 border border-surface-border">
                <Icon size={18} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ia" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0A0A0B] text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
              <Brain size={12} />
              RDPR Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Finanzas, operaciones e inteligencia artificial trabajando juntas.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Pregunta en lenguaje natural. RDPR consulta tu base de datos y responde con cifras reales, gráficos y acciones recomendadas.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                "¿Cuál fue mi beneficio el último trimestre?",
                "¿Qué clientes generan más ingresos?",
                "¿Qué proyecto está perdiendo dinero?",
                "¿Cuánto IVA tendré que pagar este trimestre?",
              ].map(q => (
                <li key={q} className="flex items-start gap-2">
                  <LineChart size={14} className="text-violet-400 mt-0.5 shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <AIChatDemo />
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Inversión en control, no en complejidad.
            </h2>
            <p className="text-text-secondary text-lg">
              La inteligencia financiera para empresas que quieren crecer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(({ name, tagline, price, suffix, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  highlight
                    ? "border-brand-500 bg-brand-50/30 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20"
                    : "border-surface-border bg-white"
                }`}
              >
                {highlight && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-3">
                    Recomendado
                  </span>
                )}
                <p className="text-lg font-bold">RDPR {name}</p>
                <p className="text-xs text-text-muted mb-4">{tagline}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold tabular-nums">{price}€</span>
                  {suffix && <span className="text-text-muted text-sm">{suffix}</span>}
                  <span className="text-text-muted text-sm">/mes</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check size={14} className="text-brand-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={highlight ? "btn-primary justify-center" : "btn-secondary justify-center"}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-surface-border bg-gradient-to-br from-brand-50 via-white to-violet-50 p-10 sm:p-16 shadow-sm">
          <BarChart3 size={32} className="text-brand-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            La nueva generación del software empresarial.
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
            Abre RDPR por la mañana y ve absolutamente todo: finanzas, ventas, proyectos y alertas importantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary justify-center py-3 px-8 text-base">
              Solicitar demostración
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary justify-center py-3 px-8 text-base">
              Acceder a la plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="font-semibold text-sm">RDPR OS</p>
              <p className="text-[11px] text-text-muted">Business Operating System</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} RDPR · Portfolio Ramón
          </p>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link href="/login" className="hover:text-text-primary transition-colors">Acceder</Link>
            <Link href="/register" className="hover:text-text-primary transition-colors">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
