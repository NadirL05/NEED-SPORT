import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  if (!process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // Expand line_items to get real prices and product names
    const session = await getStripe().checkout.sessions.retrieve(
      (event.data.object as Stripe.Checkout.Session).id,
      { expand: ['line_items'] },
    )

    // Parse items from metadata
    type ItemMeta = { id: string; quantity: number; size?: string }
    let itemsMeta: ItemMeta[] = []
    try {
      itemsMeta = JSON.parse(session.metadata?.items ?? '[]') as ItemMeta[]
    } catch { /* ignore */ }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await db.insert(orders).values({
      id: orderId,
      stripeSessionId: session.id,
      status: 'paid',
      totalEur: session.amount_total ?? 0,
      customerEmail: session.customer_details?.email ?? null,
      customerName:  session.customer_details?.name  ?? null,
      shippingAddress: session.shipping_details?.address
        ? JSON.stringify(session.shipping_details.address)
        : null,
    }).onConflictDoNothing()

    if (itemsMeta.length) {
      const lineItems = session.line_items?.data ?? []
      const itemsToInsert = itemsMeta.map((meta, i) => ({
        orderId,
        productId:   meta.id,
        productName: lineItems[i]?.description ?? meta.id,
        quantity:    meta.quantity,
        priceEur:    lineItems[i]?.price?.unit_amount ?? 0,
        size:        meta.size ?? null,
      }))
      if (itemsToInsert.length) {
        await db.insert(orderItems).values(itemsToInsert)
      }
    }
  }

  return NextResponse.json({ received: true })
}
