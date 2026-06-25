/**
 * One-shot migration: creates / updates a Stripe Product for every active
 * product in the DB, then stores the Stripe Product ID back in the DB.
 *
 * Run: DATABASE_URL="..." STRIPE_SECRET_KEY="..." npx tsx scripts/sync-stripe-products.ts
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import * as schema from '../lib/db/schema'

const sql  = neon(process.env.DATABASE_URL!)
const db   = drizzle(sql, { schema })
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })

async function syncOne(product: schema.Product): Promise<string> {
  const images = (() => {
    try {
      const parsed = JSON.parse(product.img)
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [product.img]
    } catch {
      return [product.img]
    }
  })()

  const productData = {
    name:   `${product.club} — ${product.name}`,
    images: images.filter((u: string) => u.startsWith('http')),
    metadata: { internal_id: product.id },
  }

  if (product.stripeProductId) {
    await stripe.products.update(product.stripeProductId, productData)
    return product.stripeProductId
  }

  const existing = await stripe.products.search({
    query: `metadata['internal_id']:'${product.id}'`,
    limit: 1,
  })

  if (existing.data.length > 0) {
    const sp = existing.data[0]
    await stripe.products.update(sp.id, productData)
    return sp.id
  }

  const created = await stripe.products.create(productData)
  return created.id
}

async function main() {
  const allProducts = await db.select().from(schema.products)
  console.log(`Syncing ${allProducts.length} products to Stripe…`)

  let ok = 0, skip = 0, fail = 0

  for (const product of allProducts) {
    try {
      const stripeProductId = await syncOne(product)
      await db.update(schema.products)
        .set({ stripeProductId })
        .where(eq(schema.products.id, product.id))
      console.log(`  ✓ ${product.id} → ${stripeProductId}`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${product.id}:`, err instanceof Error ? err.message : err)
      fail++
    }
  }

  console.log(`\nDone: ${ok} synced, ${skip} skipped, ${fail} failed.`)
}

main().catch((err) => { console.error(err); process.exit(1) })
