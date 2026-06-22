"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Summary = {
  totalPaidLabel: string
  totalPendingLabel: string
  totalVatLabel: string
  invoiceCount: number
}

type TaxModel = {
  code: string
  name: string
  period: string
  status: string
  amountLabel: string
  detail: string
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
  const [taxModels, setTaxModels] = useState<TaxModel[]>([])
  const [invoices, setInvoices] = useState<Inv[]>([])
  const [note, setNote] = useState("")

  useEffect(() => {
    void fetch("/api/portal/tax-summary")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setSummary(json.data.summary)
          setTaxModels(json.data.taxModels ?? [])
          setInvoices(json.data.invoices)
          setNote(json.data.note)
        }
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Resumen fiscal</h1>
        <p className="text-sm text-text-secondary">Estado orientativo de su expediente (solo lectura).</p>
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

      {taxModels.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Modelos fiscales (vista cliente)</h2>
          <div className="space-y-2">
            {taxModels.map((m) => (
              <div key={m.code} className="card py-3 px-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    Modelo {m.code} · {m.name}
                  </p>
                  <p className="text-xs text-text-muted">{m.period} · {m.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{m.amountLabel}</p>
                  <span className="text-[10px] uppercase tracking-wide text-text-muted">{m.status}</span>
                </div>
              </div>
            ))}
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
