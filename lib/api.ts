import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from './supplier-auth'

// ─── Response helpers ─────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function err(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

// ─── Supplier auth guard ──────────────────────────────────────────────────────
// Usage:
//   const auth = await requireSupplierAuth()
//   if (auth instanceof NextResponse) return auth
//   const { supplierId } = auth

export async function requireSupplierAuth(): Promise<{ supplierId: string } | NextResponse> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  const supplierId = token ? await verifySessionToken(token) : null
  if (!supplierId) return err('Non autorisé.', 401)
  return { supplierId }
}

// ─── Admin auth guard ────────────────────────────────────────────────────────
// Uses the same HMAC session token as suppliers, signed with 'admin' as the id.

const ADMIN_COOKIE = 'admin_session'

export async function requireAdminAuth(): Promise<true | NextResponse> {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  const id = token ? await verifySessionToken(token) : null
  if (id !== 'admin') return err('Non autorisé.', 401)
  return true
}

// ─── Input validation helpers ─────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v)
}

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

export function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0
}
