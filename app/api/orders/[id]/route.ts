import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/db/queries'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

// ─── Public type ──────────────────────────────────────────────────────────────

export type OrderDetail = {
  id:               string
  status:           string
  totalEur:         number
  originalTotalEur: number | null
  promoCode:        string | null
  discountEur:      number | null
  customerName:     string | null
  shippingAddress:  string | null
  createdAt:        string | null   // ISO-8601
  items: {
    productName: string
    size:        string | null
    quantity:    number
    priceEur:    number
  }[]
}

// ─── Route ────────────────────────────────────────────────────────────────────

/**
 * GET /api/orders/[id]?email=customer@example.com
 *
 * Public endpoint — no admin auth required. The customer's email acts as a
 * second-factor gate so a random order ID alone cannot expose order details.
 *
 * Rate-limited: 10 requests / 60 s per IP (Postgres-backed, Vercel-safe).
 * customerEmail is never included in the response to protect privacy.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Rate-limit by IP — 10 attempts per minute
  const limited = await enforceRateLimit(
    `order-tracking:ip:${getClientIp(req)}`,
    10,
    60,
    'Trop de tentatives. Réessayez dans une minute.',
  )
  if (limited) return limited

  // 2. Email is mandatory
  const rawEmail = req.nextUrl.searchParams.get('email')
  if (!rawEmail || rawEmail.trim() === '') {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }
  const email = rawEmail.toLowerCase().trim()

  // 3. Resolve dynamic segment
  const { id } = await params

  // 4. Load order + items in a single DB round-trip
  const order = await getOrder(id)

  // 5. Unknown order → 404 (do not leak existence before email is verified)
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  // 6. Email gate — case-insensitive comparison
  const storedEmail = order.customerEmail?.toLowerCase().trim() ?? ''
  if (!storedEmail || storedEmail !== email) {
    return NextResponse.json(
      { error: 'Email non reconnu pour cette commande' },
      { status: 401 },
    )
  }

  // 7. Build response — customerEmail is intentionally excluded
  const orderDetail: OrderDetail = {
    id:               order.id,
    status:           order.status,
    totalEur:         order.totalEur,
    originalTotalEur: order.originalTotalEur ?? null,
    promoCode:        order.promoCode ?? null,
    discountEur:      order.discountEur ?? null,
    customerName:     order.customerName ?? null,
    shippingAddress:  order.shippingAddress ?? null,
    createdAt:        order.createdAt?.toISOString() ?? null,
    items: order.items.map((i) => ({
      productName: i.productName,
      size:        i.size ?? null,
      quantity:    i.quantity,
      priceEur:    i.priceEur,
    })),
  }

  return NextResponse.json({ order: orderDetail })
}
