import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getProductsByIds } from '@/lib/db/queries'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { normalizeOptions, unitPriceCents, optionsSummary, isVintageCat, type ProductOptions } from '@/lib/pricing'

interface CartPayload {
  items: { id: string; quantity: number; size?: string; options?: Partial<ProductOptions> }[]
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(`checkout:ip:${getClientIp(req)}`, 20, 300, 'Trop de tentatives de paiement. Patientez un instant.')
  if (limited) return limited

  let payload: CartPayload
  try {
    payload = await req.json() as CartPayload
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!payload.items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  if (payload.items.length > 50) {
    return NextResponse.json({ error: 'Too many items in cart' }, { status: 400 })
  }

  // Validate quantities
  for (const item of payload.items) {
    if (!item.id || typeof item.quantity !== 'number' || item.quantity < 1) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
    }
    if (item.quantity > 100) {
      return NextResponse.json({ error: `Quantity for item ${item.id} exceeds maximum of 100` }, { status: 400 })
    }
  }

  // Look up prices server-side — never trust the client
  const productIds = payload.items.map((i) => i.id)
  const dbProducts = await getProductsByIds(productIds)
  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  const lineItems = []
  for (const item of payload.items) {
    const product = productMap.get(item.id)
    if (!product || !product.active) {
      return NextResponse.json({ error: `Product ${item.id} not available` }, { status: 400 })
    }
    // Price is computed server-side from the validated options — never trust
    // any amount sent by the client. Vintage pricing is derived from the DB
    // product category, not from the client.
    const isVintage  = isVintageCat(product.cat)
    const options    = normalizeOptions(item.options)
    const unitAmount = unitPriceCents(options, isVintage)
    const details    = [optionsSummary(options, isVintage), item.size && `Taille ${item.size}`]
      .filter(Boolean)
      .join(' · ')
    const label = `${product.club} — ${product.name}${details ? ` (${details})` : ''}`
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: label },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? `https://${req.headers.get('host')}`

  const session = await getStripe().checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] },
    allow_promotion_codes: true,
    custom_fields: [
      {
        key: 'delivery_notes',
        label: { type: 'custom', custom: 'Instructions de livraison (optionnel)' },
        type: 'text',
        optional: true,
      },
    ],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/cart`,
    metadata: {
      items: JSON.stringify(payload.items),
    },
  })

  return NextResponse.json({ url: session.url })
}
