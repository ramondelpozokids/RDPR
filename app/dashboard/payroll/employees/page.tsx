"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button, Input } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

type Employee = {
  id: string
  firstName: string
  lastName: string
  nif: string
  contractType: string
  startDate: string
  baseSalary: number
  active: boolean
}

export default function PayrollEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nif: "",
    contractType: "INDEFINIDO",
    startDate: new Date().toISOString().slice(0, 10),
    baseSalary: "",
  })

  async function load() {
    const res = await fetch("/api/payroll/employees")
    const json = await res.json()
    if (json.data) setEmployees(json.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault()
    const salary = parseFloat(form.baseSalary)
    if (!form.firstName || !form.lastName || !form.nif || salary <= 0) {
      toast.error("Completa los campos obligatorios")
      return
    }
    setSaving(true)
    const res = await fetch("/api/payroll/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        baseSalary: salary,
      }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success("Empleado añadido")
      setForm({ firstName: "", lastName: "", nif: "", contractType: "INDEFINIDO", startDate: form.startDate, baseSalary: "" })
      await load()
    } else {
      toast.error(json.error ?? "Error")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/payroll" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Payroll
      </Link>

      <h1 className="mb-6">Plantilla</h1>

      <form onSubmit={addEmployee} className="card space-y-3 mb-8">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <UserPlus size={16} />
          Nuevo empleado
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input placeholder="Apellidos" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input placeholder="NIF" value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Salario base mensual" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} />
          <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Añadir empleado"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : employees.length === 0 ? (
        <div className="card text-center py-10 text-sm text-muted-foreground">Sin empleados registrados</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Empleado</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">NIF</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Alta</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Salario</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium">{e.firstName} {e.lastName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.nif}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(e.startDate)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.baseSalary)}</td>
                  <td className="px-4 py-3">
                    <span className={e.active ? "badge-green" : "badge-gray"}>{e.active ? "Activo" : "Baja"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
