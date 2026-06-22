import { calculateTaxModel } from "@/lib/tax/calculations"
import { getTaxModel } from "@/lib/tax/models-registry"

function escapeCsv(value: string | number): string {
  const s = String(value)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n")
}

function metaRows(modelName: string, periodLabel: string, disclaimer: string): string {
  return [
    ["Modelo", modelName],
    ["Periodo", periodLabel],
    ["Generado", new Date().toISOString().slice(0, 10)],
    ["Aviso", disclaimer],
    [],
  ]
    .map((r) => (r.length ? r.map(escapeCsv).join(",") : ""))
    .join("\n")
}

export async function exportTaxModelCsv(
  companyId: string,
  modelId: string,
  periodParam?: string
): Promise<{ csv: string; filename: string } | null> {
  const model = getTaxModel(modelId)
  if (!model?.v1) return null

  const result = await calculateTaxModel(companyId, modelId, periodParam)
  if (!result) return null

  const date = new Date().toISOString().slice(0, 10)
  let csv = ""
  const filename = `modelo-${modelId}-${date}.csv`

  switch (result.modelId) {
    case "303": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Concepto", "Importe"],
          Object.entries(d.casillas).map(([k, v]) => [k, v.toFixed(2)])
        )
      break
    }
    case "390": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Trimestre", "IVA repercutido", "IVA soportado", "IVA neto"],
          d.trimestres.map((t) => [
            `T${t.quarter}`,
            t.ivaRepercutido.toFixed(2),
            t.ivaSoportado.toFixed(2),
            t.ivaNeto.toFixed(2),
          ])
        )
      break
    }
    case "130": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Concepto", "Importe"],
          [
            ["Ingresos", d.ingresos.toFixed(2)],
            ["Gastos", d.gastos.toFixed(2)],
            ["Rendimiento neto", d.rendimientoNeto.toFixed(2)],
            [`Pago fraccionado (${d.tipoAplicado * 100}%)`, d.pagoFraccionado.toFixed(2)],
          ]
        )
      break
    }
    case "131": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Concepto", "Importe"],
          [
            ["Ingresos facturados", d.ingresos.toFixed(2)],
            [`Rendimiento neto (${d.tipoRendimiento * 100}%)`, d.rendimientoNeto.toFixed(2)],
            [`Pago fraccionado (${d.tipoFraccionado * 100}%)`, d.pagoFraccionado.toFixed(2)],
          ]
        )
      break
    }
    case "111": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Perceptor", "NIF", "Base", "Tipo %", "Retención", "Factura", "Fecha"],
          d.lines.map((l) => [
            l.recipientName,
            l.recipientTaxId ?? "",
            l.baseAmount.toFixed(2),
            l.withholdingRate.toFixed(2),
            l.withholdingAmount.toFixed(2),
            l.invoiceNumber,
            l.issueDate.toISOString().slice(0, 10),
          ])
        )
      break
    }
    case "115": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Arrendador", "NIF", "Base", "Tipo %", "Retención", "Concepto", "Fecha"],
          d.lines.map((l) => [
            l.landlordName,
            l.landlordTaxId ?? "",
            l.baseAmount.toFixed(2),
            l.withholdingRate.toFixed(2),
            l.withholdingAmount.toFixed(2),
            l.description,
            l.issueDate.toISOString().slice(0, 10),
          ])
        )
      break
    }
    case "180": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Arrendador", "NIF", "Base total", "Retenciones", "Nº pagos"],
          d.landlords.map((l) => [
            l.name,
            l.taxId ?? "",
            l.totalBase.toFixed(2),
            l.totalRetenciones.toFixed(2),
            l.expenseCount,
          ])
        )
      break
    }
    case "190": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Perceptor", "NIF", "Base total", "Retenciones", "Nº facturas"],
          d.recipients.map((r) => [
            r.name,
            r.taxId ?? "",
            r.totalBase.toFixed(2),
            r.totalRetenciones.toFixed(2),
            r.invoiceCount,
          ])
        )
      break
    }
    case "200": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Concepto", "Importe"],
          [
            ["Ingresos", d.ingresos.toFixed(2)],
            ["Gastos", d.gastos.toFixed(2)],
            ["Base imponible", d.baseImponible.toFixed(2)],
            [`Cuota íntegra (${d.tipoImpositivo * 100}%)`, d.cuotaIntegra.toFixed(2)],
          ]
        )
      break
    }
    case "202": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Concepto", "Importe"],
          [
            ["Ingresos", d.ingresos.toFixed(2)],
            ["Gastos", d.gastos.toFixed(2)],
            ["Base imponible", d.baseImponible.toFixed(2)],
            [`Cuota íntegra estimada (${d.tipoImpositivo * 100}%)`, d.cuotaIntegraEstimada.toFixed(2)],
            [`Pago fraccionado (${d.tipoFraccionado * 100}%)`, d.pagoFraccionado.toFixed(2)],
            ["Vencimiento referencia", d.vencimientoReferencia],
          ]
        )
      break
    }
    case "347": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Tercero", "NIF", "Tipo", "Importe anual", "Operaciones"],
          d.parties.map((p) => [
            p.name,
            p.taxId ?? "",
            p.operationType,
            p.totalAmount.toFixed(2),
            p.operationCount,
          ])
        )
      break
    }
    case "349": {
      const d = result.data
      csv =
        metaRows(model.name, d.period.label, d.disclaimer) +
        "\n" +
        rowsToCsv(
          ["Tercero", "NIF-IVA", "País", "Tipo", "Base", "Total", "Documento", "Fecha"],
          d.operations.map((o) => [
            o.partyName,
            o.vatNumber,
            o.countryCode,
            o.operationType === "E" ? "Entrega" : "Adquisición",
            o.baseAmount.toFixed(2),
            o.totalAmount.toFixed(2),
            o.documentRef,
            o.issueDate.toISOString().slice(0, 10),
          ])
        )
      break
    }
    default:
      return null
  }

  return { csv, filename }
}
