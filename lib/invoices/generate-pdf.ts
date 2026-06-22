import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency, formatDate, INVOICE_STATUS_LABELS } from "@/lib/utils"

export type InvoicePdfInput = {
  number: string
  status: string
  issueDate: Date
  dueDate: Date | null
  paidAt: Date | null
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string | null
  company: {
    name: string
    taxId: string | null
    address: string | null
    city: string | null
    email: string | null
    phone: string | null
    brandColor: string | null
  }
  customer: {
    name: string
    taxId: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function generateInvoicePdf(invoice: InvoicePdfInput): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const brand = invoice.company.brandColor ?? "#6570f3"
  const [r, g, b] = hexToRgb(brand)

  // Header band
  doc.setFillColor(17, 24, 39)
  doc.rect(0, 0, pageW, 42, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(invoice.company.name, 14, 16)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(180, 180, 190)
  let yCompany = 22
  const companyLines = [
    invoice.company.taxId ? `NIF/CIF: ${invoice.company.taxId}` : null,
    invoice.company.address,
    invoice.company.city,
    [invoice.company.email, invoice.company.phone].filter(Boolean).join(" · ") || null,
  ].filter(Boolean) as string[]
  companyLines.forEach((line) => {
    doc.text(line, 14, yCompany)
    yCompany += 4.5
  })

  doc.setTextColor(r, g, b)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(invoice.number, pageW - 14, 16, { align: "right" })

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(180, 180, 190)
  doc.text("FACTURA", pageW - 14, 22, { align: "right" })
  doc.text(`Emision: ${formatDate(invoice.issueDate)}`, pageW - 14, 27, { align: "right" })
  if (invoice.dueDate) {
    doc.text(`Vencimiento: ${formatDate(invoice.dueDate)}`, pageW - 14, 32, { align: "right" })
  }
  doc.setTextColor(r, g, b)
  doc.text(INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status, pageW - 14, 38, { align: "right" })

  // Bill to
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("FACTURADO A", 14, 52)
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  doc.text(invoice.customer.name, 14, 58)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  let yCust = 63
  ;[
    invoice.customer.taxId ? `NIF/CIF: ${invoice.customer.taxId}` : null,
    invoice.customer.email,
    invoice.customer.phone,
    [invoice.customer.address, invoice.customer.city].filter(Boolean).join(", ") || null,
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(String(line), 14, yCust)
      yCust += 4.5
    })

  if (invoice.paidAt) {
    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(167, 243, 208)
    doc.roundedRect(pageW - 62, 48, 48, 18, 2, 2, "FD")
    doc.setTextColor(6, 95, 70)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("PAGO RECIBIDO", pageW - 58, 54)
    doc.setFont("helvetica", "normal")
    doc.text(formatDate(invoice.paidAt), pageW - 58, 60)
  }

  // Items table
  autoTable(doc, {
    startY: 78,
    head: [["Descripcion", "Cant.", "Precio unit.", "Total"]],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(2),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { halign: "right", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    alternateRowStyles: { fillColor: [248, 249, 252] },
  })

  const finalY = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 78) + 10
  const totalsX = pageW - 14

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Subtotal", totalsX - 50, finalY, { align: "right" })
  doc.text(formatCurrency(invoice.subtotal), totalsX, finalY, { align: "right" })
  doc.text(`IVA (${invoice.taxRate}%)`, totalsX - 50, finalY + 6, { align: "right" })
  doc.text(formatCurrency(invoice.taxAmount), totalsX, finalY + 6, { align: "right" })

  doc.setDrawColor(17, 24, 39)
  doc.line(totalsX - 55, finalY + 10, totalsX, finalY + 10)
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(20, 20, 20)
  doc.text("TOTAL", totalsX - 50, finalY + 17, { align: "right" })
  doc.text(formatCurrency(invoice.total), totalsX, finalY + 17, { align: "right" })

  if (invoice.notes) {
    const notesY = finalY + 28
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(120, 120, 120)
    doc.text("NOTAS Y CONDICIONES DE PAGO", 14, notesY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const split = doc.splitTextToSize(invoice.notes, pageW - 28)
    doc.text(split, 14, notesY + 5)
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 12
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text(`Generado con RDPR OS · ${new Date().getFullYear()}`, 14, footerY)
  doc.text(invoice.number, pageW - 14, footerY, { align: "right" })

  return Buffer.from(doc.output("arraybuffer"))
}
