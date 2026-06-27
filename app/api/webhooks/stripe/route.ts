import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderToAdmin,
  sendShipmentRequestToTransporter,
} from '@/lib/email'
import { getOrderBySession } from '@/lib/db/queries'

function formatAddress(a: {
  line1?: string | null
  line2?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
}) {
  return [a.line1, a.line2, `${a.postal_code ?? ''} ${a.city ?? ''}`.trim(), a.country]
    .filter(Boolean)
    .join('\n')
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
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

    // Idempotency: skip if this Stripe session already has an order
    const existing = await getOrderBySession(session.id)
    if (existing) {
      return NextResponse.json({ received: true })
    }

    // Parse items from metadata — log loudly on failure but still create the
    // order (the payment already happened; we cannot reject the webhook).
    type ItemMeta = {
      id: string
      quantity: number
      size?: string
      options?: Record<string, unknown>
    }
    let itemsMeta: ItemMeta[] = []
    try {
      const raw = JSON.parse(session.metadata?.items ?? '[]')
      if (Array.isArray(raw)) itemsMeta = raw as ItemMeta[]
      else console.error('[webhook] items metadata is not an array for session', session.id)
    } catch (e) {
      console.error('[webhook] Failed to parse items metadata for session', session.id, e)
    }

    const promoCode = session.metadata?.promoCode || null
    // Estimate discount: difference between undiscounted total and actual charged amount
    const discountEur = session.amount_subtotal != null && session.amount_total != null
      ? Math.max(0, session.amount_subtotal - session.amount_total)
      : null

    const orderId = `ord_${crypto.randomUUID()}`

    const savedItems: { productName: string; size: string | null; quantity: number; priceEur: number }[] = []

    try {
      await db.insert(orders).values({
        id: orderId,
        stripeSessionId: session.id,
        status: 'paid',
        totalEur: session.amount_total ?? 0,
        originalTotalEur: session.amount_subtotal ?? null,
        promoCode,
        discountEur,
        customerEmail: session.customer_details?.email ?? null,
        customerName:  session.customer_details?.name  ?? null,
        shippingAddress: session.collected_information?.shipping_details?.address
          ? JSON.stringify(session.collected_information.shipping_details.address)
          : null,
      }).onConflictDoNothing()

      if (itemsMeta.length) {
        const lineItems = session.line_items?.data ?? []
        if (lineItems.length !== itemsMeta.length) {
          console.error('[webhook] Line item count mismatch: Stripe=%d, metadata=%d for session %s',
            lineItems.length, itemsMeta.length, session.id)
        }
        const itemsToInsert = itemsMeta.map((meta, i) => ({
          orderId,
          productId:   meta.id,
          productName: lineItems[i]?.description ?? meta.id,
          quantity:    meta.quantity,
          priceEur:    lineItems[i]?.price?.unit_amount ?? 0,
          size:        meta.size ?? null,
          options:     meta.options ? JSON.stringify(meta.options) : null,
        }))
        if (itemsToInsert.length) {
          await db.insert(orderItems).values(itemsToInsert)
          savedItems.push(...itemsToInsert)
        }
      }
    } catch (dbErr) {
      console.error('[webhook] DB insert failed for session', session.id, dbErr)
      return NextResponse.json({ error: 'Database error — will retry' }, { status: 500 })
    }

    // Send emails — fire and forget, never block the webhook response
    const emailData = {
      orderId,
      customerName:    session.customer_details?.name  ?? null,
      customerEmail:   session.customer_details?.email ?? null,
      shippingAddress: session.collected_information?.shipping_details?.address
        ? formatAddress(session.collected_information.shipping_details.address)
        : null,
      totalEur: session.amount_total ?? 0,
      items:    savedItems,
    }
    Promise.all([
      sendOrderConfirmationToCustomer(emailData),
      sendNewOrderToAdmin(emailData),
      sendShipmentRequestToTransporter(emailData),
    ]).catch(e => console.error('[email]', e))
  }

  return NextResponse.json({ received: true })
}
