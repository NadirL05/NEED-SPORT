// Reuses crypto primitives from supplier-auth.ts with a separate secret + cookie name.
export { hashPassword, verifyPassword, sessionCookieOptions } from './supplier-auth'

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

function getSecret(): string {
  return process.env.EMPLOYEE_SESSION_SECRET ?? 'employee-dev-secret-change-in-production'
}

export const EMPLOYEE_COOKIE  = 'employee_session'
export const EMPLOYEE_MAX_AGE = 60 * 60 * 24 * 30

export async function createEmployeeToken(employeeId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(employeeId))
  return `${employeeId}.${uint8ArrayToHex(new Uint8Array(sig))}`
}

export async function verifyEmployeeToken(token: string): Promise<string | null> {
  const dot = token.indexOf('.')
  if (dot === -1) return null
  const employeeId = token.slice(0, dot)
  const sigHex = token.slice(dot + 1)
  if (!employeeId || !sigHex) return null
  try {
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    )
    const valid = await crypto.subtle.verify('HMAC', key, hexToUint8Array(sigHex), encoder.encode(employeeId))
    return valid ? employeeId : null
  } catch {
    return null
  }
}
