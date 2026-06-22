"use client"

import { useState } from "react"
import { ScanLine, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/Toaster"
import { formatCurrency } from "@/lib/utils"

export function DocumentOcrButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false)

  async function runOcr() {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/ocr`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error OCR")
      const s = json.data?.structured as {
        vendor?: string
        amount?: number
        date?: string
        confidence?: string
      } | undefined
      const parts = [
        s?.vendor && `Proveedor: ${s.vendor}`,
        s?.amount != null && `Importe: ${formatCurrency(s.amount)}`,
        s?.date && `Fecha: ${s.date}`,
      ].filter(Boolean)
      toast.success(
        parts.length ? `OCR: ${parts.join(" · ")}` : "OCR completado (sin datos claros)",
        s?.confidence ? `Confianza ${s.confidence}` : undefined
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al analizar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={runOcr} className="btn-icon" title="Analizar documento (OCR v1)" disabled={loading}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
    </button>
  )
}
