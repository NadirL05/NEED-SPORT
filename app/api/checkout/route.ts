import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getProductsByIds } from '@/lib/db/queries'

interface CartPayload {
  items: { id: string; quantity: number; size?: string }[]
}

export async function POST(req: NextRequest) {
  let payload: CartPayload
  try {
    payload = await req.json() as CartPayload
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!payload.items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Validate quantities
  for (const item of payload.items) {
    if (!item.id || typeof item.quantity !== 'number' || item.quantity < 1) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
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
    const label = item.size
      ? `${product.club} — ${product.name} (${item.size})`
      : `${product.club} — ${product.name}`
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: label },
        unit_amount: product.priceEur,
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
