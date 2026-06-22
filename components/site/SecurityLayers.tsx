import { SECURITY_LAYERS } from "@/lib/site/marketing-content"

export function SecurityLayers() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#0f172a] text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">Confianza</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">4 capas de seguridad</h2>
          <p className="text-white/80 leading-relaxed">
            Protección en transporte, acceso, documentación y disuasión frente a copia no autorizada en la web pública.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECURITY_LAYERS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-3">
                <Icon size={20} className="text-brand-300" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
