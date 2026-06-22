// Reuses crypto primitives from supplier-auth.ts with a separate secret + cookie name.
export { hashPassword, verifyPassword, passwordNeedsRehash, sessionCookieOptions } from './supplier-auth'

const encoder = new TextEncoder()

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length / 2)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ─── Secret ───────────────────────────────────────────────────────────────────
// No hardcoded fallback: a missing/short secret must fail closed, never sign
// tokens with a publicly-known constant (token forgery).
function getSecret(): string {
  const secret = process.env.EMPLOYEE_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('EMPLOYEE_SESSION_SECRET must be set and at least 32 characters long')
  }
  return secret
}

export const EMPLOYEE_COOKIE  = 'employee_session'
export const EMPLOYEE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

interface EmployeeSessionPayload {
  id:        string
  expiresAt: number
}

export async function createEmployeeToken(employeeId: string): Promise<string> {
  const payload: EmployeeSessionPayload = {
    id:        employeeId,
    expiresAt: Date.now() + EMPLOYEE_MAX_AGE * 1000,
  }
  const payloadJson = JSON.stringify(payload)
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadJson))
  const payloadB64 = btoa(payloadJson)
  return `${payloadB64}.${uint8ArrayToHex(new Uint8Array(sig))}`
}

export async function verifyEmployeeToken(token: string): Promise<string | null> {
  const dot = token.indexOf('.')
  if (dot === -1) return null
  const payloadB64 = token.slice(0, dot)
  const sigHex     = token.slice(dot + 1)
  if (!payloadB64 || !sigHex) return null
  try {
    const payloadJson = atob(payloadB64)
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    )
    const valid = await crypto.subtle.verify('HMAC', key, hexToUint8Array(sigHex), encoder.encode(payloadJson))
    if (!valid) return null
    const payload = JSON.parse(payloadJson) as EmployeeSessionPayload
    if (Date.now() >= payload.expiresAt) return null
    return payload.id
  } catch {
    return null
  }
}
