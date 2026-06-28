// Web Crypto API — works in Edge Runtime (middleware) and Node.js (API routes)
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

// ─── Secret ───────────────────────────────────────────────────────────────────

function getAdminSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set and at least 32 characters long')
  }
  return secret
}

// ─── Session token ────────────────────────────────────────────────────────────

export const ADMIN_COOKIE  = 'admin_session'
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface AdminSessionPayload {
  id:        string
  role:      'admin'
  expiresAt: number
}

export async function createAdminSessionToken(): Promise<string> {
  const payload: AdminSessionPayload = {
    id:        'admin',
    role:      'admin',
    expiresAt: Date.now() + ADMIN_MAX_AGE * 1000,
  }
  const payloadJson = JSON.stringify(payload)
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(getAdminSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadJson))
  const payloadB64 = btoa(payloadJson)
  return `${payloadB64}.${uint8ArrayToHex(new Uint8Array(sig))}`
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const dot = token.indexOf('.')
  if (dot === -1) return false
  const payloadB64 = token.slice(0, dot)
  const sigHex     = token.slice(dot + 1)
  if (!payloadB64 || !sigHex) return false
  try {
    const payloadJson = atob(payloadB64)
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(getAdminSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    )
    const valid = await crypto.subtle.verify(
      'HMAC', key, hexToUint8Array(sigHex), encoder.encode(payloadJson),
    )
    if (!valid) return false
    const payload = JSON.parse(payloadJson) as AdminSessionPayload
    if (payload.role !== 'admin') return false
    if (Date.now() >= payload.expiresAt) return false
    return true
  } catch {
    return false
  }
}

// ─── Route handler guard ──────────────────────────────────────────────────────
// Usage:
//   const auth = await requireAdminAuth()
//   if (auth !== true) return auth

export async function requireAdminAuth(): Promise<true | NextResponse> {
  const jar   = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const valid = await verifyAdminSessionToken(token)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return true
}

// ─── TOTP config guard ───────────────────────────────────────────────────────
// Call at the top of any handler that relies on TOTP 2FA.
// Rationale: without this guard the `if (totpSecret)` branch in the login
// handler is silently skipped when the env var is absent — a valid password
// alone becomes sufficient in production (silent 2FA bypass).
export function assertTotpConfigured(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_TOTP_SECRET) {
    console.error('[admin/login] ADMIN_TOTP_SECRET is required in production')
    throw new Error('Server misconfigured')
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export function adminCookieOptions(maxAge = ADMIN_MAX_AGE) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path:     '/',
  }
}
