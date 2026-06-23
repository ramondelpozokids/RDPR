"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/Toaster"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Check, X, ExternalLink } from "lucide-react"
import Link from "next/link"

type Draft = {
  id: string
  vendor: string | null
  description: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  confidence: string
  issueDate: string
  customer: { id: string; name: string } | null
  document: { id: string; name: string; fileUrl: string }
}

export default function DocumentReviewPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    fetch("/api/documents/review")
      .then((r) => r.json())
      .then((json) => setDrafts(json.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function review(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/documents/review/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      toast.success(action === "approve" ? "Gasto aprobado y contabilizado" : "Borrador rechazado")
      setDrafts((prev) => prev.filter((d) => d.id !== id))
    } else {
      toast.error("Error al procesar")
    }
  }

  if (loading) return <p className="text-sm text-text-muted">Cargando bandeja...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1>Bandeja de revisión IA</h1>
        <p className="text-sm text-text-secondary mt-1">
          Facturas detectadas por OCR pendientes de aprobación del gestor
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-text-muted">No hay borradores pendientes de revisión</p>
          <Link href="/dashboard/documents" className="text-brand-600 text-sm hover:underline mt-2 inline-block">
            Ver documentos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <div key={d.id} className="card flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{d.description}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-text-muted">
                  {d.vendor && <span>Proveedor: {d.vendor}</span>}
                  {d.customer && (
                    <Link href={`/dashboard/crm/${d.customer.id}`} className="text-brand-600 hover:underline">
                      {d.customer.name}
                    </Link>
                  )}
                  <span>{formatDate(d.issueDate)}</span>
                  <span className="badge-gray">Confianza: {d.confidence}</span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-semibold">{formatCurrency(d.total)}</span>
                  <span className="text-text-muted ml-2">
                    (Base {formatCurrency(d.subtotal)} + IVA {d.taxRate}%)
                  </span>
                </div>
                <a
                  href={d.document.fileUrl}
                  target="_blank"
                  className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 mt-2"
                >
                  {d.document.name} <ExternalLink size={10} />
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => review(d.id, "approve")}
                  className="btn-primary text-sm"
                  title="Aprobar"
                >
                  <Check size={14} /> Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => review(d.id, "reject")}
                  className="btn-secondary text-sm text-red-600"
                  title="Rechazar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
