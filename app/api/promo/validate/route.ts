import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { promoCodes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code?: string }
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

  const [promo] = await db.select().from(promoCodes)
    .where(eq(promoCodes.code, code.trim().toUpperCase()))

  if (!promo || !promo.active) {
    return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 })
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 410 })
  }

  return NextResponse.json({
    code:           promo.code,
    discountPct:    promo.discountPct,
    description:    promo.description,
    stripeCouponId: promo.stripeCouponId,
  })
}
