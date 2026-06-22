"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select, Textarea } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { ArrowLeft, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/accounting/pgc-accounts"
import Link from "next/link"

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

export default function NewExpensePage() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [vendor, setVendor] = useState("")
  const [vendorTaxId, setVendorTaxId] = useState("")
  const [category, setCategory] = useState("SERVICES")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState("PENDING")
  const [subtotal, setSubtotal] = useState("")
  const [taxRate, setTaxRate] = useState(21)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const base = parseFloat(subtotal) || 0
  const taxAmount = base * (taxRate / 100)
  const total = base + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || base <= 0) {
      toast.error("Completa descripción e importe")
      return
    }
    setLoading(true)
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description.trim(),
        vendor: vendor.trim() || undefined,
        vendorTaxId: vendorTaxId.trim() || undefined,
        category,
        issueDate,
        status,
        subtotal: base,
        taxRate,
        notes: notes.trim() || undefined,
      }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success("Gasto registrado · asiento contable creado")
      router.push("/dashboard/finance/expenses")
      router.refresh()
    } else {
      toast.error(json.error ?? "Error al guardar")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/finance/expenses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Volver a gastos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Receipt size={18} className="text-primary" />
        </div>
        <div>
          <h1>Nuevo gasto</h1>
          <p className="text-sm text-muted-foreground">Genera asiento contable con IVA soportado (472)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <Input label="Descripción *" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Suscripción software, material oficina…" />
        <Input label="Proveedor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Nombre del proveedor" />
        <Input label="NIF proveedor" value={vendorTaxId} onChange={(e) => setVendorTaxId(e.target.value)} placeholder="Para modelo 347" hint="Opcional · recomendado si supera 3.005 €/año" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORY_OPTIONS} />
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "PENDING", label: "Pendiente de pago (400 Proveedores)" },
              { value: "PAID", label: "Pagado (572 Banco)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Fecha" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          <Input label="Base imponible (€) *" type="number" min="0" step="0.01" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
          <Input label="IVA (%)" type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
        </div>

        <Textarea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Base</span>
            <span>{formatCurrency(base)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IVA ({taxRate}%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Registrar gasto
          </Button>
        </div>
      </form>
    </div>
  )
}
