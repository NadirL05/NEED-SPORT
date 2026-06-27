import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const src = readFileSync(join(ROOT, 'app/api/admin/login/route.ts'), 'utf8')

// NOTE: validateAdminConfig unit behaviour (all env combinations) is already
// covered by tests/admin-config.test.ts — we do not duplicate those cases here.
// This file contracts the structural integration of that guard inside the route.

describe('[admin-login] source-code contracts', () => {
  // ── Configuration guard ───────────────────────────────────────────────────

  it('[admin-login] guard: validateAdminConfig is the first call in POST, before enforceRateLimit', () => {
    const postHandlerPos = src.indexOf('export async function POST')
    const validatePos = src.indexOf('validateAdminConfig(', postHandlerPos)
    const rateLimitPos = src.indexOf('enforceRateLimit(', postHandlerPos)
    assert.ok(postHandlerPos >= 0, 'POST handler must be exported')
    assert.ok(validatePos >= 0, 'validateAdminConfig must be called in POST handler')
    assert.ok(rateLimitPos >= 0, 'enforceRateLimit must be called in POST handler')
    assert.ok(
      validatePos < rateLimitPos,
      'validateAdminConfig must appear before enforceRateLimit — config is checked first',
    )
  })

  // ── Brute-force protection ────────────────────────────────────────────────

  it('[admin-login] brute-force: rate-limit key is scoped per-IP (contains :ip:)', () => {
    assert.match(
      src,
      /admin-login:ip:/,
      'rate-limit key must include :ip: so each attacker IP is counted independently',
    )
  })

  // ── Timing-safe password comparison ──────────────────────────────────────

  it('[admin-login] security: timingSafeEqual is used for password comparison', () => {
    assert.match(
      src,
      /timingSafeEqual\(/,
      'timingSafeEqual must be used — string equality (===) leaks timing information',
    )
  })

  it('[admin-login] security: === is never used to compare password and secret directly', () => {
    assert.doesNotMatch(
      src,
      /password\s*===\s*secret|secret\s*===\s*password/,
      'password must never be compared with === — use timingSafeEqual only',
    )
  })

  it('[admin-login] security: secret.length !== password.length double guard prevents length oracle attacks', () => {
    assert.match(
      src,
      /secret\.length\s*!==\s*password\.length/,
      'length check must be present alongside timingSafeEqual to prevent length oracle',
    )
  })

  // ── Two-factor authentication ─────────────────────────────────────────────

  it('[admin-login] 2FA: twoFactorRequired: true is included in the 401 response when TOTP is needed', () => {
    assert.match(
      src,
      /twoFactorRequired:\s*true/,
      'twoFactorRequired: true must be present in the 2FA challenge response',
    )
  })

  // ── Logout / cookie clearing ──────────────────────────────────────────────

  it('[admin-login] logout: DELETE handler clears the session cookie with empty string and maxAge 0', () => {
    assert.match(
      src,
      /ADMIN_COOKIE,\s*'',\s*adminCookieOptions\(0\)/,
      "DELETE must call cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0)) to expire the cookie",
    )
  })
})
