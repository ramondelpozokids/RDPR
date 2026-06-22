import { getActiveCompanyContext } from "@/lib/company/context"
import { IntelligenceChat } from "@/components/intelligence/IntelligenceChat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Shield, Database, Zap } from "lucide-react"
import Link from "next/link"

export default async function IntelligencePage() {
  const ctx = await getActiveCompanyContext()
  if (!ctx) {
    return (
      <Card className="text-center py-16">
        <p className="text-muted-foreground text-sm">No tienes ninguna empresa asociada.</p>
        <Link href="/register" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
          Crear empresa
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={22} className="text-primary" />
          <h1>RDPR Intelligence</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Consultas inteligentes sobre {ctx.company.name} — datos en tiempo real, sin salir del dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IntelligenceChat companyName={ctx.company.name} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Capacidades v0</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <Database size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Facturación, cobros, IVA, clientes y proyectos de la empresa activa.</span>
              </div>
              <div className="flex gap-2">
                <Shield size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Solo lectura — tus datos nunca se modifican desde aquí.</span>
              </div>
              <div className="flex gap-2">
                <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Próximamente: IA generativa, informes automáticos y predicciones.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ejemplos de preguntas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {[
                "¿Cuánto he facturado este mes?",
                "¿Qué facturas están vencidas?",
                "¿Qué clientes generan más ingresos?",
                "¿Cuántos proyectos activos hay?",
              ].map((q) => (
                <p key={q} className="px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border">
                  {q}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
