"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/Toaster"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Plus } from "lucide-react"

type Account = { id: string; name: string; iban: string | null; bankName: string | null }

export function BankingPanel({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "")
  const [csv, setCsv] = useState("")
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [importing, setImporting] = useState(false)

  async function createAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch("/api/banking/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setCreating(false)
    if (res.ok) {
      toast.success("Cuenta bancaria creada")
      setNewName("")
      router.refresh()
    } else {
      toast.error("Error al crear cuenta")
    }
  }

  async function importCsv(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId || !csv.trim()) return
    setImporting(true)
    const res = await fetch("/api/banking/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountId: accountId, csv }),
    })
    setImporting(false)
    const json = await res.json()
    if (res.ok) {
      toast.success(`${json.data.imported} movimiento(s) importado(s)`)
      setCsv("")
      router.refresh()
    } else {
      toast.error(json.error ?? "Error al importar")
    }
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crear cuenta bancaria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Añade una cuenta para importar movimientos CSV y conciliar con facturas y gastos.
          </p>
          <form onSubmit={createAccount} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ej. Cuenta principal BBVA"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" disabled={creating}>
              <Plus size={14} /> Crear
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar movimientos CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={importCsv} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cuenta</label>
              <select
                className="input w-full mt-1"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                CSV (fecha, descripción, importe)
              </label>
              <textarea
                className="input w-full mt-1 min-h-[160px] font-mono text-xs"
                placeholder={"fecha,descripcion,importe\n22/06/2025,Transferencia cliente,1500.00\n21/06/2025,Pago proveedor,-320,50"}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={importing || !csv.trim()}>
              <Upload size={14} />
              {importing ? "Importando…" : "Importar CSV"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Formatos: dd/mm/yyyy o yyyy-mm-dd. Importe positivo = entrada, negativo = salida. Separador coma o punto y coma.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nueva cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createAccount} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Nombre de la cuenta"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={creating}>
              <Plus size={14} /> Añadir
            </Button>
          </form>
          <ul className="mt-4 space-y-2 text-sm">
            {accounts.map((a) => (
              <li key={a.id} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium">{a.name}</span>
                <span className="text-muted-foreground text-xs">{a.iban ?? a.bankName ?? "—"}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
