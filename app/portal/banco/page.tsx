"use client"

import { useState, useEffect } from "react"
import { Button, Input } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { Landmark, CheckCircle2 } from "lucide-react"

export default function PortalBancoPage() {
  const [iban, setIban] = useState("")
  const [bankName, setBankName] = useState("")
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/portal/bank")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.status === "CONNECTED") {
          setConnected(true)
          setIban(json.data.iban ?? "")
          setBankName(json.data.bankName ?? "")
        }
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/portal/bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iban, bankName }),
    })
    if (res.ok) {
      toast.success("Cuenta registrada")
      setConnected(true)
    } else {
      const json = await res.json()
      toast.error("Error", json.error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <Landmark size={20} /> Conexión bancaria
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Registre su IBAN para conciliación. Open Banking (PSD2) próximamente.
        </p>
      </div>

      {connected ? (
        <div className="card text-center py-8 space-y-2">
          <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
          <p className="font-medium">Cuenta conectada</p>
          <p className="text-sm font-mono text-text-secondary">{iban}</p>
          {bankName && <p className="text-xs text-text-muted">{bankName}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <Input
            label="IBAN"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="ES00 0000 0000 0000 0000 0000"
            required
          />
          <Input
            label="Nombre del banco"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Opcional"
          />
          <Button type="submit" loading={loading} className="w-full justify-center">
            Conectar cuenta
          </Button>
        </form>
      )}
    </div>
  )
}
