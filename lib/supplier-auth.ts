// Web Crypto API — works in Edge Runtime (middleware) and Node.js (API routes)

const encoder = new TextEncoder()

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length / 2)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return arr
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const saltArr = crypto.getRandomValues(new Uint8Array(16))
  const salt = uint8ArrayToHex(saltArr)
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltArr, iterations: 100_000, hash: 'SHA-256' },
    key, 256,
  )
  return `${salt}:${uint8ArrayToHex(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(':')
  if (!saltHex || !storedHash) return false
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToUint8Array(saltHex), iterations: 100_000, hash: 'SHA-256' },
    key, 256,
  )
  const computedHash = uint8ArrayToHex(new Uint8Array(bits))
  // Timing-safe comparison to prevent timing attacks
  const a = Buffer.from(computedHash)
  const b = Buffer.from(storedHash)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

// ─── Session token ────────────────────────────────────────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SUPPLIER_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SUPPLIER_SESSION_SECRET must be set and at least 32 characters long')
  }
  return secret
}

export const SESSION_COOKIE = 'supplier_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

interface SessionPayload {
  id: string
  expiresAt: number
}

export async function createSessionToken(supplierId: string): Promise<string> {
  const payload: SessionPayload = {
    id: supplierId,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  }
  const payloadJson = JSON.stringify(payload)
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadJson))
  const payloadB64 = btoa(payloadJson)
  return `${payloadB64}.${uint8ArrayToHex(new Uint8Array(sig))}`
}

export async function verifySessionToken(token: string): Promise<string | null> {
  const dot = token.indexOf('.')
  if (dot === -1) return null
  const payloadB64 = token.slice(0, dot)
  const sigHex = token.slice(dot + 1)
  if (!payloadB64 || !sigHex) return null
  try {
    const payloadJson = atob(payloadB64)
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(getSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    )
    const valid = await crypto.subtle.verify('HMAC', key, hexToUint8Array(sigHex), encoder.encode(payloadJson))
    if (!valid) return null
    const payload = JSON.parse(payloadJson) as SessionPayload
    if (Date.now() >= payload.expiresAt) return null
    return payload.id
  } catch {
    return null
  }
}

// ─── Cookie helpers (for Route Handlers) ─────────────────────────────────────

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}
