import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { getUpcomingFiscalDeadlines } from "../lib/gestoria/fiscal-deadlines"

describe("fiscal deadlines", () => {
  it("genera vencimientos 303 trimestral para autónomo", () => {
    const from = new Date(2026, 0, 15)
    const deadlines = getUpcomingFiscalDeadlines(
      { entityType: "AUTONOMO", vatFilingPeriod: "QUARTERLY" },
      from,
      365
    )
    assert.ok(deadlines.some((d) => d.modelId === "303"))
    assert.ok(deadlines.some((d) => d.modelId === "130"))
  })

  it("incluye modelo 390 para sociedad", () => {
    const from = new Date(2026, 10, 1)
    const deadlines = getUpcomingFiscalDeadlines(
      { entityType: "SL", vatFilingPeriod: "QUARTERLY" },
      from,
      120
    )
    assert.ok(deadlines.some((d) => d.modelId === "390"))
  })

  it("ordena por fecha ascendente", () => {
    const deadlines = getUpcomingFiscalDeadlines(
      { entityType: "AUTONOMO", vatFilingPeriod: "QUARTERLY" },
      new Date(2026, 0, 1),
      365
    )
    for (let i = 1; i < deadlines.length; i++) {
      assert.ok(deadlines[i].dueDate >= deadlines[i - 1].dueDate)
    }
  })
})
