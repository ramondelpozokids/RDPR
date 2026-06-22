import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency } from "@/lib/utils"

export type PayslipPdfInput = {
  period: string
  companyName: string
  employeeName: string
  nif: string
  gross: number
  deductions: number
  net: number
}

export function generatePayslipPdf(input: PayslipPdfInput): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFillColor(17, 24, 39)
  doc.rect(0, 0, pageW, 32, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Recibo de salarios", 14, 14)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`${input.companyName} · Periodo ${input.period}`, 14, 22)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(11)
  doc.text(`Empleado: ${input.employeeName}`, 14, 44)
  doc.text(`NIF: ${input.nif}`, 14, 51)

  autoTable(doc, {
    startY: 58,
    head: [["Concepto", "Importe"]],
    body: [
      ["Devengos (bruto)", formatCurrency(input.gross)],
      ["Deducciones", formatCurrency(input.deductions)],
      ["Líquido a percibir", formatCurrency(input.net)],
    ],
    theme: "grid",
    headStyles: { fillColor: [101, 112, 243] },
    columnStyles: { 1: { halign: "right" } },
  })

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(
    "Documento orientativo generado por RDPR Payroll MVP. No sustituye nómina oficial ni CRA.",
    14,
    doc.internal.pageSize.getHeight() - 10
  )

  return Buffer.from(doc.output("arraybuffer"))
}

export function parsePayrollPeriod(period: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  }
}

export function currentPayrollPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
