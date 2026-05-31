import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type { CartItem } from '@/lib/store'

export async function POST(req: NextRequest) {
  let items: CartItem[]
  try {
    const body = await req.json() as { items: CartItem[] }
    items = body.items
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? `https://${req.headers.get('host')}`

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
            name: item.size
              ? `${item.club} — ${item.name} (${item.size})`
              : `${item.club} — ${item.name}`,
          },
        unit_amount: item.priceEur,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/`,
  })

  return NextResponse.json({ url: session.url })
}
