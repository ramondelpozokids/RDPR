import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { DossierData } from "@/lib/dossier/build-dossier-data"
import { formatCurrency } from "@/lib/utils"

type DocWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } }

function fmt(n: number) {
  return formatCurrency(n)
}

export function generateDossierPdf(data: DossierData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as DocWithAutoTable
  const margin = 14
  let y = margin

  doc.setFontSize(18)
  doc.setTextColor(40, 40, 40)
  doc.text(data.legalName, margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Dossier ejecutivo · RDPR OS", margin, y)
  y += 5
  doc.text(`Generado: ${data.generatedAt.toLocaleDateString("es-ES")}`, margin, y)
  if (data.taxId) {
    y += 5
    doc.text(`NIF/CIF: ${data.taxId}`, margin, y)
  }
  y += 10

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text("Resumen ejecutivo", margin, y)
  y += 6
  doc.setFontSize(9)
  const summary =
    "Una razón social con múltiples marcas comerciales. Impuestos unificados (303, 200, 347). " +
    "Documento orientativo — no sustituye asesoramiento legal ni fiscal."
  const summaryLines = doc.splitTextToSize(summary, 180)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 4 + 8

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Cobrado mes (todas las marcas)", fmt(data.revenue.totals.collectedMonth)],
      ["Emitido mes", fmt(data.revenue.totals.emittedMonth)],
      ["IVA neto trimestre (303)", fmt(data.tax303.ivaNeto)],
      ["IS estimado anual (200)", fmt(data.tax200.cuotaIntegra)],
      ["Terceros 347 declarables", String(data.tax347.parties.length)],
      ["Marcas activas", String(data.brands.length)],
    ],
    theme: "grid",
    headStyles: { fillColor: [101, 112, 243] },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  doc.setFontSize(12)
  doc.text("Ingresos por marca comercial", margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [["Marca", "Cobrado mes", "Emitido mes", "Año cobrado", "Pendiente", "%"]],
    body: data.revenue.rows.map((r) => [
      r.name,
      fmt(r.collectedMonth),
      fmt(r.emittedMonth),
      fmt(r.collectedYear),
      fmt(r.pending),
      `${r.sharePct}%`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  if (y > 250) {
    doc.addPage()
    y = margin
  }

  doc.setFontSize(12)
  doc.text("Calendario fiscal SL (orientativo)", margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [["Modelo", "Descripción", "Periodicidad"]],
    body: [
      ["303", "IVA autoliquidación", "Trimestral"],
      ["390", "Resumen anual IVA", "Anual"],
      ["200", "Impuesto Sociedades", "Anual (julio)"],
      ["111 / 190", "Retenciones", "Trimestral / anual"],
      ["347", "Operaciones > 3.005 €", "Febrero"],
      ["202", "Pagos fraccionados IS", "Abr, Oct, Dic"],
    ],
    theme: "grid",
    headStyles: { fillColor: [100, 100, 100] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  if (y > 240) {
    doc.addPage()
    y = margin
  }

  doc.setFontSize(12)
  doc.text("Constitución SL — checklist", margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    body: [
      ["Denominación social", data.legalName],
      ["Capital social mínimo", "3.000 €"],
      ["Administrador", data.founder],
      ["Registro Mercantil + NIF", "Pendiente verificar"],
      ["Registro marcas OMPI", "RDPR, CourtManager Pro, Creauna"],
      ["Cuenta bancaria empresa", "Requerida para operar"],
    ],
    theme: "plain",
    styles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    margin: { left: margin, right: margin },
  })

  if (data.insights.length > 0) {
    y = doc.lastAutoTable.finalY + 10
    if (y > 250) {
      doc.addPage()
      y = margin
    }
    doc.setFontSize(12)
    doc.text("Alertas fiscales", margin, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Alerta", "Detalle"]],
      body: data.insights.slice(0, 5).map((i) => [i.title, i.message]),
      theme: "striped",
      styles: { fontSize: 7 },
      margin: { left: margin, right: margin },
    })
  }

  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(
    "RDPR OS · Documento orientativo generado automáticamente",
    margin,
    doc.internal.pageSize.height - 8
  )

  const buf = doc.output("arraybuffer")
  return Buffer.from(buf)
}
