"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { ArrowLeft, Plus, Loader2, FileDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Line = {
  id: string
  gross: number
  deductions: number
  net: number
  employee: { firstName: string; lastName: string; nif: string }
}

type Run = {
  id: string
  period: string
  status: string
  lines: Line[]
}

export default function PayrollRunsPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftLines, setDraftLines] = useState<Line[]>([])

  async function load() {
    const res = await fetch("/api/payroll/runs")
    const json = await res.json()
    if (json.data) setRuns(json.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function createRun() {
    setCreating(true)
    const res = await fetch("/api/payroll/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Nómina ${json.data.period} creada`)
      await load()
    } else {
      toast.error(json.error ?? "Error")
    }
    setCreating(false)
  }

  function startEdit(run: Run) {
    setEditingId(run.id)
    setDraftLines(run.lines.map((l) => ({ ...l })))
  }

  async function saveEdit(runId: string) {
    const res = await fetch(`/api/payroll/runs/${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: draftLines.map((l) => ({ id: l.id, gross: l.gross, deductions: l.deductions })) }),
    })
    if (res.ok) {
      toast.success("Nómina actualizada")
      setEditingId(null)
      await load()
    } else {
      toast.error("Error al guardar")
    }
  }

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/payroll" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} />
        Payroll
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1>Nóminas</h1>
        <Button onClick={createRun} disabled={creating}>
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Generar mes actual
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : runs.length === 0 ? (
        <div className="card text-center py-10 text-sm text-muted-foreground">
          Genera la primera nómina del mes con empleados activos en plantilla.
        </div>
      ) : (
        <div className="space-y-6">
          {runs.map((run) => (
            <div key={run.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Periodo {run.period}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{run.status.toLowerCase()}</p>
                </div>
                <div className="flex gap-2">
                  {editingId === run.id ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                      <Button size="sm" onClick={() => saveEdit(run.id)}>Guardar</Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => startEdit(run)}>Editar líneas</Button>
                  )}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Empleado</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Bruto</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Deducciones</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Neto</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(editingId === run.id ? draftLines : run.lines).map((line) => (
                    <tr key={line.id}>
                      <td className="py-2">{line.employee.firstName} {line.employee.lastName}</td>
                      <td className="py-2 text-right">
                        {editingId === run.id ? (
                          <input
                            type="number"
                            className="input w-24 text-right text-xs"
                            value={line.gross}
                            onChange={(e) =>
                              setDraftLines((prev) =>
                                prev.map((l) =>
                                  l.id === line.id ? { ...l, gross: parseFloat(e.target.value) || 0, net: (parseFloat(e.target.value) || 0) - l.deductions } : l
                                )
                              )
                            }
                          />
                        ) : (
                          formatCurrency(line.gross)
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {editingId === run.id ? (
                          <input
                            type="number"
                            className="input w-24 text-right text-xs"
                            value={line.deductions}
                            onChange={(e) =>
                              setDraftLines((prev) =>
                                prev.map((l) =>
                                  l.id === line.id
                                    ? { ...l, deductions: parseFloat(e.target.value) || 0, net: l.gross - (parseFloat(e.target.value) || 0) }
                                    : l
                                )
                              )
                            }
                          />
                        ) : (
                          formatCurrency(line.deductions)
                        )}
                      </td>
                      <td className="py-2 text-right font-medium">{formatCurrency(line.net)}</td>
                      <td className="py-2 text-right">
                        <a
                          href={`/api/payroll/runs/${run.id}?lineId=${line.id}`}
                          target="_blank"
                          className="text-brand-600 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <FileDown size={12} />
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
