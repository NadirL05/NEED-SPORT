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
//
// Hash format is versioned to allow transparent migration of the work factor:
//   new:    `salt:iterations:hash`  (3 parts)
//   legacy: `salt:hash`             (2 parts, implicitly 100_000 iterations)
//
// OWASP (2023) recommends >= 600_000 iterations for PBKDF2-HMAC-SHA256.
// `verifyPassword` reads the iteration count from the stored hash, so old
// hashes keep verifying; `passwordNeedsRehash` flags them so the login routes
// can re-hash with the current work factor on the next successful sign-in.
export const PBKDF2_ITERATIONS = 600_000

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key, 256,
  )
  return uint8ArrayToHex(new Uint8Array(bits))
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  if (x.length !== y.length) return false
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

/** Parse a stored hash into its components, tolerating the legacy 2-part form. */
function parseStored(stored: string): { saltHex: string; iterations: number; hash: string } | null {
  const parts = stored.split(':')
  if (parts.length === 3) {
    const iterations = parseInt(parts[1], 10)
    if (!Number.isInteger(iterations) || iterations <= 0) return null
    return { saltHex: parts[0], iterations, hash: parts[2] }
  }
  if (parts.length === 2) {
    return { saltHex: parts[0], iterations: 100_000, hash: parts[1] }
  }
  return null
}

export async function hashPassword(password: string): Promise<string> {
  const saltArr = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, saltArr, PBKDF2_ITERATIONS)
  return `${uint8ArrayToHex(saltArr)}:${PBKDF2_ITERATIONS}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseStored(stored)
  if (!parsed) return false
  const computed = await derive(password, hexToUint8Array(parsed.saltHex), parsed.iterations)
  return timingSafeEqualHex(computed, parsed.hash)
}

/**
 * True when a stored hash uses an outdated work factor (legacy format or fewer
 * than the current iteration count) and should be re-hashed after a successful
 * verification. Never throws — an unparseable hash is treated as not needing a
 * rehash (the verification already failed).
 */
export function passwordNeedsRehash(stored: string): boolean {
  const parsed = parseStored(stored)
  if (!parsed) return false
  return parsed.iterations < PBKDF2_ITERATIONS
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
