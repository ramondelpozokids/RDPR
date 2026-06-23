import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import {
  isPublicRegistrationEnabled,
  registrationClosedMessage,
} from "../lib/auth/registration"
import { isStorageConfigured, requiresRealStorage } from "../lib/storage/config"

describe("registration", () => {
  const env = process.env

  beforeEach(() => {
    process.env = { ...env }
  })

  afterEach(() => {
    process.env = env
  })

  it("permite registro cuando INVITE_ONLY no está activo", () => {
    delete process.env.INVITE_ONLY
    assert.equal(isPublicRegistrationEnabled(), true)
  })

  it("bloquea registro sin token cuando INVITE_ONLY=true", () => {
    process.env.INVITE_ONLY = "true"
    process.env.REGISTRATION_INVITE_TOKEN = "secreto-test"
    assert.equal(isPublicRegistrationEnabled(), false)
    assert.match(registrationClosedMessage(), /cerrado/i)
  })

  it("permite registro con token válido", () => {
    process.env.INVITE_ONLY = "true"
    process.env.REGISTRATION_INVITE_TOKEN = "secreto-test"
    assert.equal(isPublicRegistrationEnabled("secreto-test"), true)
    assert.equal(isPublicRegistrationEnabled("otro"), false)
  })
})

describe("storage config", () => {
  const env = process.env

  beforeEach(() => {
    process.env = { ...env }
  })

  afterEach(() => {
    process.env = env
  })

  it("detecta storage incompleto", () => {
    delete process.env.STORAGE_ENDPOINT
    assert.equal(isStorageConfigured(), false)
  })

  it("detecta storage completo", () => {
    process.env.STORAGE_ENDPOINT = "https://example.r2.cloudflarestorage.com"
    process.env.STORAGE_ACCESS_KEY_ID = "key"
    process.env.STORAGE_SECRET_ACCESS_KEY = "secret"
    process.env.STORAGE_BUCKET_NAME = "bucket"
    process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL = "https://cdn.example.com"
    assert.equal(isStorageConfigured(), true)
  })

  it("requiresRealStorage en Vercel", () => {
    process.env.VERCEL = "1"
    assert.equal(requiresRealStorage(), true)
    delete process.env.VERCEL
  })
})
