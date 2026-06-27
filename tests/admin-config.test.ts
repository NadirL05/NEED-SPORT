import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateAdminConfig } from '../lib/admin-config'

describe('validateAdminConfig', () => {
  // A1 — production sans ADMIN_TOTP_SECRET → erreur
  it('returns a misconfiguration error when ADMIN_TOTP_SECRET is absent in production', () => {
    const result = validateAdminConfig({
      NODE_ENV: 'production',
      ADMIN_SECRET: 'super-secret',
    })
    assert.deepEqual(result, { error: 'Server misconfigured.' })
  })

  // A2 — production avec les deux secrets → null
  it('returns null when both secrets are present in production', () => {
    const result = validateAdminConfig({
      NODE_ENV: 'production',
      ADMIN_SECRET: 'super-secret',
      ADMIN_TOTP_SECRET: 'totp-secret',
    })
    assert.equal(result, null)
  })

  // A3 — development sans ADMIN_TOTP_SECRET → null (TOTP non requis hors prod)
  it('returns null when ADMIN_TOTP_SECRET is absent outside production', () => {
    const result = validateAdminConfig({
      NODE_ENV: 'development',
      ADMIN_SECRET: 'super-secret',
    })
    assert.equal(result, null)
  })

  // A4 — ADMIN_SECRET absent (peu importe NODE_ENV) → erreur
  it('returns a misconfiguration error when ADMIN_SECRET is absent', () => {
    const result = validateAdminConfig({
      NODE_ENV: 'production',
      ADMIN_TOTP_SECRET: 'totp-secret',
    })
    assert.deepEqual(result, { error: 'Server misconfigured.' })
  })

  it('returns a misconfiguration error when ADMIN_SECRET is absent in development', () => {
    const result = validateAdminConfig({
      NODE_ENV: 'development',
    })
    assert.deepEqual(result, { error: 'Server misconfigured.' })
  })
})
