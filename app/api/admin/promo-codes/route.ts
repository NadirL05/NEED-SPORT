import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { promoCodes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/api'
import { getStripe } from '@/lib/stripe'

const createSchema = z.object({
  code:        z.string().min(2).max(30).toUpperCase(),
  discountPct: z.number().int().min(1).max(100),
  description: z.string().max(120).default(''),
  showOnSite:  z.boolean().default(false),
  expiresAt:   z.string().nullable().optional(),
})

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await db.select().from(promoCodes).orderBy(promoCodes.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })

  const { code, discountPct, description, showOnSite, expiresAt } = parsed.data

  // Create Stripe coupon
  let stripeCouponId: string | null = null
  try {
    const coupon = await getStripe().coupons.create({
      id:                `NS_${code}`,
      percent_off:       discountPct,
      duration:          'once',
      name:              `${code} — ${discountPct}% off`,
      ...(expiresAt ? { redeem_by: Math.floor(new Date(expiresAt).getTime() / 1000) } : {}),
    })
    stripeCouponId = coupon.id
  } catch {
    // Coupon may already exist — try to reuse it
    try {
      const existing = await getStripe().coupons.retrieve(`NS_${code}`)
      stripeCouponId = existing.id
    } catch {
      // Continue without Stripe coupon
    }
  }

  const id = `pc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const [row] = await db.insert(promoCodes).values({
    id,
    code,
    discountPct,
    description,
    showOnSite,
    active: true,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    stripeCouponId,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id, active, showOnSite } = await req.json() as { id: string; active?: boolean; showOnSite?: boolean }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (typeof active === 'boolean')      update.active      = active
  if (typeof showOnSite === 'boolean')  update.showOnSite  = showOnSite

  const [row] = await db.update(promoCodes).set(update).where(eq(promoCodes.id, id)).returning()
  return NextResponse.json(row)
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.delete(promoCodes).where(eq(promoCodes.id, id))
  return NextResponse.json({ ok: true })
}
