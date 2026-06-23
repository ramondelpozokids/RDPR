import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  getPlanLimits,
  resolvePlanId,
  PlanLimitError,
  PLAN_LIMITS,
} from "../lib/billing/plan-limits"

describe("plan-limits", () => {
  it("resuelve plan trial por defecto", () => {
    assert.equal(resolvePlanId(null), "trial")
    assert.equal(resolvePlanId("unknown"), "trial")
  })

  it("starter no incluye open banking ni intelligence", () => {
    const limits = getPlanLimits("starter")
    assert.equal(limits.maxClients, 25)
    assert.equal(limits.openBanking, false)
    assert.equal(limits.intelligence, false)
  })

  it("professional incluye open banking e intelligence", () => {
    const limits = getPlanLimits("professional")
    assert.equal(limits.maxClients, 100)
    assert.equal(limits.openBanking, true)
    assert.equal(limits.intelligence, true)
  })

  it("PlanLimitError expone código", () => {
    const err = new PlanLimitError("CLIENTS", "Límite alcanzado")
    assert.equal(err.code, "CLIENTS")
    assert.equal(err.name, "PlanLimitError")
  })

  it("todos los planes tienen límites positivos", () => {
    for (const plan of Object.values(PLAN_LIMITS)) {
      assert.ok(plan.maxClients > 0)
      assert.ok(plan.maxOcrPerMonth > 0)
    }
  })
})

describe("ocr-vision helpers", () => {
  it("isVisionConfigured sin clave", async () => {
    const prev = process.env.GOOGLE_VISION_API_KEY
    delete process.env.GOOGLE_VISION_API_KEY
    const { isVisionConfigured } = await import("../lib/documents/ocr-vision")
    assert.equal(isVisionConfigured(), false)
    if (prev) process.env.GOOGLE_VISION_API_KEY = prev
  })
})
