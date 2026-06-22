"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Summary = {
  totalPaidLabel: string
  totalPendingLabel: string
  totalVatLabel: string
  invoiceCount: number
}

type Inv = {
  id: string
  number: string
  issueDate: string
  total: number
  status: string
}

export default function PortalImpuestosPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [invoices, setInvoices] = useState<Inv[]>([])
  const [note, setNote] = useState("")

  useEffect(() => {
    void fetch("/api/portal/tax-summary")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setSummary(json.data.summary)
          setInvoices(json.data.invoices)
          setNote(json.data.note)
        }
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Resumen fiscal</h1>
        <p className="text-sm text-text-secondary">Vista orientativa de su expediente de facturación.</p>
      </div>

      {summary && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-xs text-text-muted mb-1">Cobrado</p>
            <p className="text-xl font-bold text-emerald-600">{summary.totalPaidLabel}</p>
          </div>
          <div className="card">
            <p className="text-xs text-text-muted mb-1">Pendiente</p>
            <p className="text-xl font-bold text-amber-600">{summary.totalPendingLabel}</p>
          </div>
          <div className="card">
            <p className="text-xs text-text-muted mb-1">IVA facturado</p>
            <p className="text-xl font-bold">{summary.totalVatLabel}</p>
          </div>
        </div>
      )}

      {note && (
        <p className="text-xs text-text-muted bg-surface-muted rounded-lg p-3">{note}</p>
      )}

      {invoices.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-muted">
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted">Factura</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted">Fecha</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-text-muted">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-2 font-mono text-xs">{i.number}</td>
                  <td className="px-4 py-2 text-text-muted">{formatDate(i.issueDate)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(i.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
