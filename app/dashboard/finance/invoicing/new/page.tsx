// app/(dashboard)/invoices/new/page.tsx
"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams }       from "next/navigation"
import { Button, Input, Select, Textarea }  from "@/components/ui"
import { toast }                            from "@/components/ui/Toaster"
import { ArrowLeft, Plus, Trash2, FilePlus, AlertCircle } from "lucide-react"
import { formatCurrency }                   from "@/lib/utils"
import Link                                 from "next/link"

interface LineItem {
  id:          string
  description: string
  quantity:    number
  unitPrice:   number
}

const newItem = (): LineItem => ({
  id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0,
})

interface FormErrors {
  customerId?: string
  items?: string
  global?: string
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-secondary">Cargando...</div>}>
      <NewInvoiceForm />
    </Suspense>
  )
}

function NewInvoiceForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [customers, setCustomers] = useState<{ value: string; label: string }[]>([])
  const [customerId, setCustomerId] = useState(params.get("customerId") ?? "")
  const [dueDate,   setDueDate]   = useState("")
  const [notes,     setNotes]     = useState("")
  const [taxRate,   setTaxRate]   = useState(21)
  const [withholdingRate, setWithholdingRate] = useState(0)
  const [items,     setItems]     = useState<LineItem[]>([newItem()])
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    fetch("/api/customers")
      .then(r => r.json())
      .then(d => {
        if (d.success) setCustomers(d.data.map((c: any) => ({ value: c.id, label: c.name })))
      })
  }, [])

  const subtotal  = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const withholdingAmount = withholdingRate > 0 ? subtotal * (withholdingRate / 100) : 0
  const total     = subtotal + taxAmount - withholdingAmount

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    if (errors.items) setErrors(e => ({ ...e, items: undefined }))
  }

  function removeItem(id: string) {
    if (items.length === 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!customerId)             e.customerId = "Debes seleccionar un cliente"
    const emptyDesc = items.some(i => !i.description.trim())
    if (emptyDesc)               e.items = "Todos los conceptos deben tener descripci├│n"
    const zeroAmt  = items.some(i => i.unitPrice <= 0)
    if (zeroAmt)                 e.items = (e.items ? e.items + " ┬À " : "") + "Revisa los precios (deben ser > 0)"
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        dueDate:  dueDate  || undefined,
        notes:    notes    || undefined,
        taxRate,
        withholdingRate: withholdingRate > 0 ? withholdingRate : undefined,
        items: items.map(i => ({
          description: i.description.trim(),
          quantity:    Number(i.quantity),
          unitPrice:   Number(i.unitPrice),
        })),
      }),
    })

    if (res.ok) {
      const d = await res.json()
      toast.success("Factura creada", d.data.number)
      router.push("/dashboard/finance/invoicing")
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error al crear la factura", d.error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/finance/invoicing" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1>Nueva factura</h1>
          <p className="text-sm text-text-secondary mt-0.5">El n├║mero FAC-YYYY-XXXX se asignar├í autom├íticamente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Cliente + Fechas */}
        <div className="card space-y-4">
          <p className="section-title">Datos de facturaci├│n</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Cliente *"
              options={customers}
              placeholder={customers.length ? "Selecciona un cliente" : "Cargando clientes..."}
              value={customerId}
              onChange={e => { setCustomerId(e.target.value); setErrors(er => ({ ...er, customerId: undefined })) }}
              error={errors.customerId}
            />
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              hint="Opcional ┬À Aparecer├í en el PDF"
            />
          </div>
          <Textarea
            label="Notas y condiciones de pago"
            placeholder="Ej: Pago a 30 d├¡as ┬À Transferencia bancaria ┬À IBAN ES00 0000 0000 0000 0000 0000"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Conceptos */}
        <div className="card">
          <p className="section-title">Conceptos</p>

          {/* Column headers ÔÇö desktop */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-text-muted uppercase tracking-wide px-1 mb-2">
            <span className="col-span-6">Descripci├│n</span>
            <span className="col-span-2 text-right">Cant.</span>
            <span className="col-span-3 text-right">Precio unit.</span>
            <span className="col-span-1 text-right">Subtotal</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice
              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                  {/* Description */}
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      className={`input ${!item.description && errors.items ? "input-error" : ""}`}
                      placeholder={`Concepto ${idx + 1} ÔÇö descripci├│n del servicio`}
                      value={item.description}
                      onChange={e => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  {/* Quantity */}
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      className="input text-right font-mono"
                      type="number" min="0.01" step="0.01"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      placeholder="1"
                    />
                  </div>
                  {/* Unit price */}
                  <div className="col-span-5 sm:col-span-3">
                    <input
                      className={`input text-right font-mono ${item.unitPrice <= 0 && errors.items ? "input-error" : ""}`}
                      type="number" min="0" step="0.01"
                      value={item.unitPrice === 0 ? "" : item.unitPrice}
                      onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  {/* Line total + delete */}
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                    <span className="text-xs font-mono text-text-secondary hidden sm:block">
                      {formatCurrency(lineTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="btn-icon opacity-0 group-hover:opacity-100 hover:text-red-500 disabled:opacity-0 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Error */}
          {errors.items && (
            <div className="flex items-center gap-2 mt-3 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              <AlertCircle size={13} />
              {errors.items}
            </div>
          )}

          {/* Add line */}
          <button
            type="button"
            onClick={() => setItems(prev => [...prev, newItem()])}
            className="mt-4 btn-ghost text-brand-600 hover:text-brand-700 hover:bg-brand-50 text-sm"
          >
            <Plus size={14} />
            A├▒adir concepto
          </button>

          {/* Totals */}
          <div className="mt-5 pt-4 border-t border-surface-border flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>IVA</span>
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="text-xs border border-surface-border rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {[0, 4, 10, 21].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>Ret. IRPF</span>
                  <select
                    value={withholdingRate}
                    onChange={e => setWithholdingRate(Number(e.target.value))}
                    className="text-xs border border-surface-border rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {[0, 7, 15, 19].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                {withholdingRate > 0 && (
                  <span className="font-mono text-red-600">-{formatCurrency(withholdingAmount)}</span>
                )}
              </div>
              <div className="flex justify-between items-center font-bold text-text-primary text-base pt-2 border-t border-surface-border">
                <span>Total</span>
                <span className="font-mono text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/finance/invoicing">
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={loading} icon={<FilePlus size={15} />}>
            Crear factura
          </Button>
        </div>
      </form>
    </div>
  )
}
