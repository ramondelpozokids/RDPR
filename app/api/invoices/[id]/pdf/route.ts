// app/api/invoices/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma }  from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getLegalDisplayName } from "@/lib/brands/catalog"
import { generateInvoicePdf } from "@/lib/invoices/generate-pdf"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await syncOverdueInvoices(companyId)

  const invoice = await prisma.invoice.findFirst({
    where:   { id: params.id, companyId },
    include: { customer: true, items: true, company: true, brand: true },
  })
  if (!invoice) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })

  const legalName = getLegalDisplayName(invoice.company)
  const brandLine = invoice.brand && invoice.brand.type !== "MAIN"
    ? `<div class="brand-line">${invoice.brand.name}</div>`
    : ""

  const { searchParams } = new URL(req.url)
  const download = searchParams.get("download") === "1"
  const format = searchParams.get("format") ?? "html"

  if (format === "pdf") {
    const buffer = generateInvoicePdf({
      number: invoice.number,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      company: invoice.company,
      customer: invoice.customer,
      items: invoice.items,
    })
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${invoice.number}.pdf"`,
      },
    })
  }

  const statusMap: Record<string, string> = {
    PENDING: "Pendiente", PAID: "Pagada", OVERDUE: "Vencida", CANCELLED: "Cancelada"
  }
  const statusColor: Record<string, string> = {
    PENDING: "#92400e|#fef3c7", PAID: "#065f46|#d1fae5",
    OVERDUE: "#991b1b|#fee2e2", CANCELLED: "#374151|#f3f4f6"
  }
  const [statusFg, statusBg] = (statusColor[invoice.status] ?? "#374151|#f3f4f6").split("|")

  const isPaid = invoice.status === "PAID"

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Factura ${invoice.number} · ${invoice.company.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      font-family:'Inter',system-ui,sans-serif;
      font-size:13px;color:#111827;background:#f8f9fc;
      min-height:100vh;
    }
    .page-wrapper{
      max-width:800px;margin:0 auto;padding:32px 24px;
    }
    /* Top toolbar (hidden in print) */
    .toolbar{
      display:flex;align-items:center;justify-content:space-between;
      background:#fff;border-radius:16px;border:1px solid #e8eaf0;
      padding:14px 20px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,.05);
    }
    .toolbar-title{font-size:14px;font-weight:600;color:#111827}
    .toolbar-sub{font-size:12px;color:#6b7280;margin-top:2px}
    .btn-dl{
      display:inline-flex;align-items:center;gap:8px;
      background:#6570f3;color:#fff;border:none;cursor:pointer;
      padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;
      font-family:'Inter',sans-serif;transition:background .15s;
    }
    .btn-dl:hover{background:#5254e7}
    .btn-print{
      display:inline-flex;align-items:center;gap:8px;
      background:#fff;color:#374151;border:1px solid #e8eaf0;cursor:pointer;
      padding:9px 18px;border-radius:10px;font-size:13px;font-weight:500;
      font-family:'Inter',sans-serif;margin-right:8px;transition:background .15s;
    }
    .btn-print:hover{background:#f8f9fc}

    /* Invoice card */
    .invoice{
      background:#fff;border-radius:20px;border:1px solid #e8eaf0;
      box-shadow:0 4px 24px rgba(0,0,0,.06);overflow:hidden;
    }

    /* Header band */
    .inv-header{
      background:linear-gradient(135deg,#111827 0%,#1f2937 100%);
      padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start;
    }
    .company-name{font-size:22px;font-weight:700;color:#fff;letter-spacing:-.5px}
    .company-details{margin-top:8px;color:#9ca3af;font-size:12px;line-height:1.8}
    .inv-meta{text-align:right}
    .inv-label{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px}
    .inv-number{font-size:28px;font-weight:700;color:#6570f3;margin-top:4px;letter-spacing:-.5px}
    .inv-dates{margin-top:12px;font-size:12px;color:#9ca3af;line-height:1.8}
    .status-pill{
      display:inline-block;margin-top:12px;
      padding:5px 14px;border-radius:999px;font-size:11px;font-weight:700;
      background:${statusBg};color:${statusFg};letter-spacing:.3px;
    }
    ${isPaid ? `.watermark{
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);
      font-size:96px;font-weight:800;color:rgba(16,185,129,.08);
      white-space:nowrap;pointer-events:none;letter-spacing:4px;
    }` : ""}

    /* Body */
    .inv-body{padding:36px 40px;position:relative}

    /* Bill-to */
    .bill-to-wrapper{
      display:flex;gap:24px;margin-bottom:32px;
    }
    .bill-box{
      flex:1;background:#f8f9fc;border-radius:12px;border:1px solid #e8eaf0;padding:18px 20px;
    }
    .bill-label{
      font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
      color:#9ca3af;margin-bottom:8px;
    }
    .bill-name{font-size:14px;font-weight:700;color:#111827}
    .bill-detail{font-size:12px;color:#6b7280;margin-top:4px;line-height:1.7}

    /* Items table */
    .items-table{width:100%;border-collapse:collapse;margin-bottom:28px}
    .items-table thead tr{background:#111827}
    .items-table thead th{
      color:#fff;text-align:left;padding:11px 14px;
      font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;
    }
    .items-table thead th:not(:first-child){text-align:right}
    .items-table tbody tr{border-bottom:1px solid #f0f0f3}
    .items-table tbody tr:last-child{border:none}
    .items-table tbody td{padding:13px 14px;color:#374151;font-size:13px}
    .items-table tbody td:not(:first-child){text-align:right;font-variant-numeric:tabular-nums}
    .items-table tbody tr:nth-child(even){background:#fafafa}

    /* Totals */
    .totals-wrapper{display:flex;justify-content:flex-end;margin-bottom:32px}
    .totals-box{width:260px}
    .totals-row{
      display:flex;justify-content:space-between;align-items:center;
      padding:6px 0;font-size:13px;color:#6b7280;
    }
    .totals-row.grand{
      border-top:2px solid #111827;margin-top:8px;padding-top:14px;
      font-size:17px;font-weight:700;color:#111827;
    }

    /* Notes */
    .notes-box{
      background:#f8f9fc;border-radius:12px;border:1px solid #e8eaf0;
      padding:16px 20px;margin-bottom:32px;
    }
    .notes-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:6px}
    .notes-text{font-size:12px;color:#374151;line-height:1.7}

    /* Footer */
    .inv-footer{
      border-top:1px solid #e8eaf0;padding:20px 40px;
      display:flex;justify-content:space-between;align-items:center;
      background:#fafafa;
    }
    .footer-brand{font-size:11px;color:#9ca3af}
    .footer-page{font-size:11px;color:#9ca3af}

    @media print{
      body{background:#fff!important;padding:0!important}
      .toolbar{display:none!important}
      .page-wrapper{padding:0!important;max-width:100%!important}
      .invoice{border:none!important;border-radius:0!important;box-shadow:none!important}
      @page{size:A4;margin:12mm 10mm}
    }
  </style>
</head>
<body>
<div class="page-wrapper">

  <!-- Toolbar -->
  <div class="toolbar">
    <div>
      <div class="toolbar-title">${invoice.number}</div>
      <div class="toolbar-sub">${invoice.company.name} · ${formatDate(invoice.issueDate)}</div>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">
        🖨 Imprimir
      </button>
      <a class="btn-dl" href="?format=pdf&download=1">
        ⬇ Descargar PDF
      </a>
      <a class="btn-print" href="?format=html" style="margin-left:8px">
        Vista HTML
      </a>
    </div>
  </div>

  <!-- Invoice -->
  <div class="invoice">

    <!-- Dark header -->
    <div class="inv-header">
      <div>
        <div class="company-name">${legalName}</div>
        ${brandLine}
        <div class="company-details">
          ${invoice.company.taxId   ? `NIF/CIF: ${invoice.company.taxId}<br>`   : ""}
          ${invoice.company.address ? `${invoice.company.address}<br>`          : ""}
          ${invoice.company.city    ? `${invoice.company.city}<br>`             : ""}
          ${invoice.company.email   ? invoice.company.email                     : ""}
          ${invoice.company.phone   ? ` · ${invoice.company.phone}`             : ""}
        </div>
      </div>
      <div class="inv-meta">
        <div class="inv-label">Factura</div>
        <div class="inv-number">${invoice.number}</div>
        <div class="inv-dates">
          Emisión: ${formatDate(invoice.issueDate)}<br>
          ${invoice.dueDate ? `Vencimiento: ${formatDate(invoice.dueDate)}` : ""}
        </div>
        <div class="status-pill">${statusMap[invoice.status]}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="inv-body">
      ${isPaid ? '<div class="watermark">PAGADA</div>' : ""}

      <!-- Bill to -->
      <div class="bill-to-wrapper">
        <div class="bill-box">
          <div class="bill-label">Facturado a</div>
          <div class="bill-name">${invoice.customer.name}</div>
          <div class="bill-detail">
            ${invoice.customer.taxId   ? `NIF/CIF: ${invoice.customer.taxId}<br>` : ""}
            ${invoice.customer.email   ? `${invoice.customer.email}<br>`          : ""}
            ${invoice.customer.phone   ? `${invoice.customer.phone}<br>`          : ""}
            ${invoice.customer.address ? `${invoice.customer.address}`            : ""}
            ${invoice.customer.city    ? `, ${invoice.customer.city}`             : ""}
          </div>
        </div>
        ${invoice.paidAt ? `
        <div class="bill-box" style="flex:0 0 auto;min-width:160px;border-color:#d1fae5;background:#f0fdf4;">
          <div class="bill-label" style="color:#059669;">Pago recibido</div>
          <div class="bill-name" style="color:#065f46;">${formatDate(invoice.paidAt)}</div>
          <div class="bill-detail" style="color:#059669;">✓ Cobrada</div>
        </div>` : ""}
      </div>

      <!-- Items -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:48%;border-radius:8px 0 0 8px">Descripción</th>
            <th style="width:12%">Cant.</th>
            <th style="width:18%">Precio unit.</th>
            <th style="width:22%;border-radius:0 8px 8px 0">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
          <tr>
            <td><strong>${item.description}</strong></td>
            <td>${item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td><strong>${formatCurrency(item.total)}</strong></td>
          </tr>`).join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-wrapper">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="totals-row">
            <span>IVA (${invoice.taxRate}%)</span>
            <span>${formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div class="totals-row grand">
            <span>TOTAL</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      ${invoice.notes ? `
      <div class="notes-box">
        <div class="notes-label">Notas y condiciones de pago</div>
        <div class="notes-text">${invoice.notes}</div>
      </div>` : ""}
    </div>

    <!-- Footer -->
    <div class="inv-footer">
      <span class="footer-brand">Generado con RDPR OS · ${new Date().getFullYear()}</span>
      <span class="footer-page">${invoice.number}</span>
    </div>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...(download ? { "Content-Disposition": `attachment; filename="${invoice.number}.html"` } : {}),
    },
  })
}
