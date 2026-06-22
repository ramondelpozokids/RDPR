import {
  TrendingUp, Users, FileText, FolderKanban,
  ArrowUpRight, Sparkles,
} from "lucide-react"
import Image from "next/image"
import { SITE_IMAGES } from "@/lib/site/config"

const METRICS = [
  { label: "Facturación", value: "42.380 €", delta: "+18%", icon: TrendingUp, color: "text-brand-600", bg: "bg-brand-50" },
  { label: "Beneficio neto", value: "18.420 €", delta: "+12%", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Clientes activos", value: "127", delta: "+8", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Proyectos", value: "23", delta: "6 activos", icon: FolderKanban, color: "text-amber-600", bg: "bg-amber-50" },
]

const COMPANIES = [
  { name: "CourtManager Pro", pct: 61, color: "bg-brand-500" },
  { name: "BOOKIA Publisher", pct: 23, color: "bg-violet-500" },
  { name: "Creauna", pct: 16, color: "bg-emerald-500" },
]

export default function DashboardPreview() {
  return (
    <div className="landing-dashboard relative rounded-2xl border border-surface-border/80 bg-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border bg-surface-muted/30">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="flex-1 mx-4 h-6 rounded-md bg-white border border-surface-border text-[10px] text-text-muted flex items-center justify-center font-mono">
          rdpr.app/dashboard
        </div>
      </div>

      <div className="flex min-h-[340px]">
        <aside className="hidden sm:flex w-44 shrink-0 border-r border-surface-border bg-surface-muted/20 flex-col p-3 gap-1">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <Image src={SITE_IMAGES.logo} alt="RDPR" width={24} height={24} className="rounded-md object-contain" />
            <span className="text-xs font-semibold">RDPR OS</span>
          </div>
          {["Inicio", "Finanzas", "CRM", "Proyectos", "Editorial"].map((item, i) => (
            <div
              key={item}
              className={`text-xs px-2.5 py-1.5 rounded-lg ${i === 0 ? "bg-brand-50 text-brand-700 font-medium" : "text-text-muted"}`}
            >
              {item}
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4 sm:p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Portfolio Ramón</p>
              <p className="text-sm font-semibold text-text-primary">Dashboard ejecutivo</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-brand-600 bg-brand-50 px-2 py-1 rounded-full border border-brand-100">
              <Sparkles size={10} />
              IA activa
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {METRICS.map(({ label, value, delta, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-surface-border p-2.5 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center`}>
                    <Icon size={12} className={color} />
                  </div>
                  <span className="text-[9px] font-medium text-emerald-600 flex items-center gap-0.5">
                    {delta} <ArrowUpRight size={8} />
                  </span>
                </div>
                <p className="text-sm font-bold text-text-primary tabular-nums">{value}</p>
                <p className="text-[9px] text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-surface-border p-3 bg-white">
            <p className="text-[10px] font-medium text-text-secondary mb-2.5">Rendimiento por empresa</p>
            <div className="space-y-2">
              {COMPANIES.map(({ name, pct, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-[9px] text-text-muted w-24 truncate">{name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-text-secondary w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
