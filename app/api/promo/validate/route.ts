import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { promoCodes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(`promo:ip:${getClientIp(req)}`, 10, 60, 'Trop de tentatives.')
  if (limited) return limited

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const code =
    typeof (body as Record<string, unknown>)?.code === 'string'
      ? ((body as Record<string, unknown>).code as string).trim().toUpperCase()
      : null

  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

  const [promo] = await db.select().from(promoCodes)
    .where(eq(promoCodes.code, code))

  if (!promo || !promo.active) {
    return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 })
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 410 })
  }

  return NextResponse.json({
    code:        promo.code,
    discountPct: promo.discountPct,
    description: promo.description,
  })
}
