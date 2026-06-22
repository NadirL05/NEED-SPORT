import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from './db'
import { rateLimits } from './db/schema'

export interface RateLimitResult {
  ok:            boolean
  remaining:     number
  retryAfterSec: number
}

/**
 * Fixed-window rate limiter backed by the existing Postgres (Neon) database.
 *
 * Chosen over an in-memory limiter because Vercel serverless functions do not
 * share memory between invocations — a per-instance counter would be trivially
 * bypassed. A single atomic UPSERT keeps the counter consistent across all
 * instances without any new infrastructure.
 *
 * Fails OPEN on database errors: a limiter outage must never lock every user
 * out of login/checkout. Errors are logged for monitoring.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  try {
    const firstExpiry = new Date(Date.now() + windowSec * 1000)
    const [row] = await db
      .insert(rateLimits)
      .values({ key, count: 1, expiresAt: firstExpiry })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          // Reset the window if it has elapsed, otherwise increment.
          count: sql`CASE WHEN ${rateLimits.expiresAt} < now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
          expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} < now() THEN now() + (${windowSec}::int * interval '1 second') ELSE ${rateLimits.expiresAt} END`,
        },
      })
      .returning({ count: rateLimits.count, expiresAt: rateLimits.expiresAt })

    const count     = row?.count ?? 1
    const expiresAt = row?.expiresAt ? new Date(row.expiresAt) : firstExpiry
    const retryAfterSec = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))

    if (count > limit) return { ok: false, remaining: 0, retryAfterSec }
    return { ok: true, remaining: Math.max(0, limit - count), retryAfterSec }
  } catch (e) {
    console.error('[rate-limit] failing open:', e)
    return { ok: true, remaining: limit, retryAfterSec: 0 }
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Build a 429 response with a Retry-After header. */
export function tooMany(
  retryAfterSec: number,
  message = 'Trop de tentatives. Réessayez plus tard.',
): NextResponse {
  return NextResponse.json(
    { error: message, retryAfterSec },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
  )
}

/**
 * Convenience guard: enforce a limit and return a ready-to-send 429 response
 * when exceeded, or `null` when the request may proceed.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSec: number,
  message?: string,
): Promise<NextResponse | null> {
  const res = await rateLimit(key, limit, windowSec)
  if (!res.ok) return tooMany(res.retryAfterSec, message)
  return null
}
