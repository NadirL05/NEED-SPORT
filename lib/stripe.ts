import Stripe from 'stripe'
import type { Product } from './db/schema'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

export async function syncStripeProduct(product: Product): Promise<string> {
  const stripe = getStripe()

  const images = (() => {
    try {
      const parsed = JSON.parse(product.img)
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [product.img]
    } catch {
      return [product.img]
    }
  })()

  const productData = {
    name: `${product.club} — ${product.name}`,
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
