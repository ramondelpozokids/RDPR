"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/Toaster"
import type { BillingPlanId } from "@/lib/stripe/billing"

export function CheckoutButton({
  plan,
  label,
  variant = "default",
}: {
  plan: BillingPlanId
  label: string
  variant?: "default" | "secondary"
}) {
  const [loading, setLoading] = useState(false)

  async function checkout() {
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
        return
      }
      toast.error(json.error ?? "Pagos no disponibles todavía")
    } catch {
      toast.error("Error al iniciar pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant === "secondary" ? "secondary" : "default"} className="w-full" onClick={checkout} disabled={loading}>
      {loading ? "Redirigiendo…" : label}
    </Button>
  )
}
