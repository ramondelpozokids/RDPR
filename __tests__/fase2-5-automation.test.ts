import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { answerPortalFaq } from "../lib/portal/faq"
import { extractDocumentOcr } from "../lib/documents/ocr-extract"

describe("portal faq", () => {
  it("responde sobre documentos", () => {
    const a = answerPortalFaq("¿Cómo subo un documento?")
    assert.match(a, /documento/i)
  })

  it("responde fallback genérico", () => {
    const a = answerPortalFaq("xyzabc123")
    assert.match(a, /mensaje/i)
  })
})

describe("ocr extract v2", () => {
  it("extrae total y base de texto de factura", () => {
    const r = extractDocumentOcr("factura-proveedor.pdf", "Total: 121,00\nBase: 100,00\nIVA (21%)")
    assert.equal(r.structured.amount, 121)
    assert.ok(r.structured.subtotal)
    assert.equal(r.structured.confidence, "high")
  })
})
