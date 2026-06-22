"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button, Input, Textarea } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { Scale, FileText, Plus, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

type Template = { id: string; title: string; category: string; updatedAt: string }
type LegalCase = {
  id: string
  title: string
  status: string
  updatedAt: string
  customer?: { name: string } | null
  _count: { documents: number }
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En curso",
  CLOSED: "Cerrado",
}

export default function LegalPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [cases, setCases] = useState<LegalCase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [caseTitle, setCaseTitle] = useState("")
  const [templateForm, setTemplateForm] = useState({ title: "", category: "contrato", body: "" })

  async function load() {
    const [t, c] = await Promise.all([
      fetch("/api/legal/templates").then((r) => r.json()),
      fetch("/api/legal/cases").then((r) => r.json()),
    ])
    if (t.data) setTemplates(t.data)
    if (c.data) setCases(c.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function addCase(e: React.FormEvent) {
    e.preventDefault()
    if (!caseTitle.trim()) return
    setSaving(true)
    const res = await fetch("/api/legal/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: caseTitle.trim() }),
    })
    if (res.ok) {
      toast.success("Expediente creado")
      setCaseTitle("")
      await load()
    } else {
      toast.error("Error al crear expediente")
    }
    setSaving(false)
  }

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!templateForm.title.trim() || !templateForm.body.trim()) return
    setSaving(true)
    const res = await fetch("/api/legal/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateForm),
    })
    if (res.ok) {
      toast.success("Plantilla guardada")
      setTemplateForm({ title: "", category: "contrato", body: "" })
      await load()
    } else {
      toast.error("Error al guardar plantilla")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-5xl">
      <div className="page-header">
        <div>
          <h1>RDPR Legal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Expedientes jurídicos y plantillas contractuales (v0)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Scale size={16} />
            Expedientes
          </h2>
          <form onSubmit={addCase} className="flex gap-2 mb-4">
            <Input placeholder="Título del expediente" value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear
            </Button>
          </form>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : cases.length === 0 ? (
            <div className="card text-sm text-muted-foreground py-8 text-center">Sin expedientes jurídicos</div>
          ) : (
            <ul className="card divide-y p-0">
              {cases.map((c) => (
                <li key={c.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {STATUS_LABELS[c.status] ?? c.status}
                      {c.customer?.name ? ` · ${c.customer.name}` : ""}
                      · {c._count.documents} doc(s)
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(c.updatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <FileText size={16} />
            Plantillas
          </h2>
          <form onSubmit={addTemplate} className="card space-y-3 mb-4">
            <Input placeholder="Título" value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} />
            <Input placeholder="Categoría (contrato, acta…)" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} />
            <Textarea placeholder="Contenido de la plantilla…" rows={5} value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
            <Button type="submit" disabled={saving}>Guardar plantilla</Button>
          </form>
          {templates.length > 0 && (
            <ul className="card divide-y p-0">
              {templates.map((t) => (
                <li key={t.id} className="px-4 py-3">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {formatDate(t.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Vincula documentos a expedientes desde el módulo Documentos. Solicita firmas desde{" "}
        <Link href="/dashboard/signatures" className="text-primary hover:underline">RDPR Signature</Link>.
        Registro RGPD en{" "}
        <Link href="/dashboard/compliance" className="text-primary hover:underline">Compliance</Link>.
      </p>
    </div>
  )
}
