import { NextRequest, NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { buildDossierData } from "@/lib/dossier/build-dossier-data"
import { generateDossierPdf } from "@/lib/dossier/generate-dossier-pdf"
import { BRAND_TYPE_LABELS } from "@/lib/brands/catalog"
import { formatCurrency } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await buildDossierData(companyId)
  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") ?? "html"
  const download = searchParams.get("download") === "1"
  const slug = data.legalName.replace(/\s+/g, "-").toLowerCase()

  if (format === "pdf") {
    const buffer = generateDossierPdf(data)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="dossier-${slug}.pdf"`,
      },
    })
  }

  const revenueRows = data.revenue.rows
    .map(
      (r) => `
      <tr>
        <td><span class="dot" style="background:${r.brandColor}"></span>${r.name}</td>
        <td class="num">${formatCurrency(r.collectedMonth)}</td>
        <td class="num">${formatCurrency(r.emittedMonth)}</td>
        <td class="num">${formatCurrency(r.collectedYear)}</td>
        <td class="num">${formatCurrency(r.pending)}</td>
        <td class="num">${r.sharePct}%</td>
      </tr>`
    )
    .join("")

  const brandCards = data.brands
    .map(
      (b) => `
      <div class="brand-card">
        <span class="dot-lg" style="background:${b.brandColor}"></span>
        <div>
          <strong>${b.name}</strong>
          <p>${BRAND_TYPE_LABELS[b.type as keyof typeof BRAND_TYPE_LABELS] ?? b.type}</p>
          ${b.tagline ? `<p class="muted">${b.tagline}</p>` : ""}
        </div>
      </div>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Dossier · ${data.legalName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;font-size:13px;color:#111827;background:#f8f9fc;line-height:1.5}
    .wrap{max-width:900px;margin:0 auto;padding:32px 24px}
    .toolbar{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 18px;margin-bottom:24px}
    .toolbar h1{font-size:15px}
    .toolbar p{font-size:12px;color:#6b7280}
    .actions{display:flex;gap:8px}
    .btn{padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;border:1px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer}
    .btn-primary{background:#6570f3;color:#fff;border-color:#6570f3}
    .doc{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden}
    .hero{background:linear-gradient(135deg,#111827,#374151);color:#fff;padding:32px 36px}
    .hero h2{font-size:24px;margin-bottom:4px}
    .hero p{color:#9ca3af;font-size:13px}
    .body{padding:32px 36px}
    section{margin-bottom:28px}
    section h3{font-size:14px;margin-bottom:10px;border-bottom:2px solid #6570f3;padding-bottom:4px;display:inline-block}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
    .stat{background:#f8f9fc;border:1px solid #e5e7eb;border-radius:10px;padding:14px}
    .stat label{font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600}
    .stat strong{display:block;font-size:18px;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px}
    th,td{padding:8px 10px;border-bottom:1px solid #f0f0f3;text-align:left}
    th{background:#111827;color:#fff;font-size:10px;text-transform:uppercase}
    td.num{text-align:right;font-variant-numeric:tabular-nums}
    .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
    .brand-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}
    .brand-card{display:flex;gap:10px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa}
    .dot-lg{width:10px;height:10px;border-radius:50%;margin-top:4px;flex-shrink:0}
    .brand-card p{font-size:11px;color:#6b7280;margin-top:2px}
    .muted{font-size:10px!important}
    .disclaimer{font-size:11px;color:#6b7280;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb}
    ul{padding-left:18px;font-size:12px;color:#374151}
    li{margin-bottom:4px}
    @media print{
      body{background:#fff}
      .toolbar{display:none}
      .wrap{padding:0;max-width:100%}
      .doc{border:none;border-radius:0}
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="toolbar">
    <div>
      <h1>Dossier ejecutivo</h1>
      <p>${data.legalName} · ${data.generatedAt.toLocaleDateString("es-ES")}</p>
    </div>
    <div class="actions">
      <button class="btn" onclick="window.print()">Imprimir</button>
      <a class="btn btn-primary" href="?format=pdf&download=1">Descargar PDF</a>
    </div>
  </div>
  <div class="doc">
    <div class="hero">
      <h2>${data.legalName}</h2>
      <p>Una razón social · múltiples marcas comerciales · impuestos unificados</p>
      ${data.taxId ? `<p style="margin-top:8px">NIF/CIF: ${data.taxId}</p>` : ""}
    </div>
    <div class="body">
      <section>
        <h3>Indicadores clave</h3>
        <div class="grid">
          <div class="stat"><label>Cobrado ${data.revenue.periodLabel}</label><strong>${formatCurrency(data.revenue.totals.collectedMonth)}</strong></div>
          <div class="stat"><label>IVA neto trimestre</label><strong>${formatCurrency(data.tax303.ivaNeto)}</strong></div>
          <div class="stat"><label>IS estimado</label><strong>${formatCurrency(data.tax200.cuotaIntegra)}</strong></div>
        </div>
      </section>
      <section>
        <h3>Ingresos por marca</h3>
        <table>
          <thead><tr><th>Marca</th><th>Cobrado mes</th><th>Emitido mes</th><th>Año cobrado</th><th>Pendiente</th><th>%</th></tr></thead>
          <tbody>${revenueRows || '<tr><td colspan="6">Sin facturas registradas</td></tr>'}</tbody>
        </table>
      </section>
      <section>
        <h3>Marcas comerciales (${data.brands.length})</h3>
        <div class="brand-grid">${brandCards}</div>
      </section>
      <section>
        <h3>Calendario fiscal SL</h3>
        <ul>
          <li>303 IVA — trimestral</li>
          <li>390 resumen IVA — anual</li>
          <li>200 Impuesto Sociedades — julio</li>
          <li>111 / 190 retenciones</li>
          <li>347 operaciones &gt; 3.005 € — febrero</li>
        </ul>
      </section>
      <p class="disclaimer">${data.tax303.disclaimer} Documento generado por RDPR OS — orientativo, no sustituye asesoramiento profesional.</p>
    </div>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...(download ? { "Content-Disposition": `attachment; filename="dossier-${slug}.html"` } : {}),
    },
  })
}
