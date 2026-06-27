/**
 * Run: DATABASE_URL="..." STRIPE_SECRET_KEY="..." npx tsx scripts/seed-promo-codes.ts
 * Creates 3 promo codes (NEED15, ALIYA15, AMR15) in Stripe and the DB.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { promoCodes } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const CODES = [
  { code: 'NEED15',  discountPct: 15, description: 'Code promo NEED15 — -15% sur le panier' },
  { code: 'ALIYA15', discountPct: 15, description: 'Code promo ALIYA15 — -15% sur le panier' },
  { code: 'AMR15',   discountPct: 15, description: 'Code promo AMR15 — -15% sur le panier' },
]

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  const stripeKey   = process.env.STRIPE_SECRET_KEY
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')
  if (!stripeKey)   throw new Error('STRIPE_SECRET_KEY is not set')

  const sql    = neon(databaseUrl)
  const db     = drizzle(sql, { schema: { promoCodes } })
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })

  for (const promo of CODES) {
    const existing = await db.select().from(promoCodes).where(eq(promoCodes.code, promo.code))
    if (existing.length > 0) {
      console.log(`${promo.code} already exists in DB — skipping`)
      continue
    }

    let stripeCouponId: string
    try {
      const coupon = await stripe.coupons.create({
        id: `NS_${promo.code}`,
        percent_off: promo.discountPct,
        duration:    'once',
        name:        promo.code,
      })
      stripeCouponId = coupon.id
      console.log(`Created Stripe coupon: ${coupon.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('already exists') || msg.includes('Coupon already exists')) {
        stripeCouponId = `NS_${promo.code}`
        console.log(`Stripe coupon NS_${promo.code} already exists — reusing`)
      } else {
        throw err
      }
    }

    await db.insert(promoCodes).values({
      id:            crypto.randomUUID(),
      code:          promo.code,
      discountPct:   promo.discountPct,
      description:   promo.description,
      active:        true,
      showOnSite:    false,
      stripeCouponId,
    })
    console.log(`Inserted promo code: ${promo.code} (coupon: ${stripeCouponId})`)
  }

  console.log('Done!')
}

main().catch((err) => { console.error(err); process.exit(1) })
