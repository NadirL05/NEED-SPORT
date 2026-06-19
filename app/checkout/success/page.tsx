import Link from 'next/link'
import type { Metadata } from 'next'
import { getOrderBySession } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { orderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ClearCart from './ClearCart'

export const metadata: Metadata = {
  title: 'Commande confirmée — NEEDSPORT.',
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  const order = session_id ? await getOrderBySession(session_id) : null
  const items = order
    ? await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    : []

  let address: Record<string, string> | null = null
  if (order?.shippingAddress) {
    try { address = JSON.parse(order.shippingAddress) as Record<string, string> } catch { /* ignore */ }
  }

  function formatPrice(cents: number) {
    return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px' }}>
      <ClearCart />
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent)', color: '#000',
            display: 'grid', placeItems: 'center',
            fontSize: '1.8rem', margin: '0 auto 24px',
            boxShadow: '0 0 40px var(--accent-glow)',
          }}>
            ✓
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', marginBottom: 10 }}>
            Dans le sac.
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Ta commande est confirmée.{order?.customerEmail ? ` Un e-mail de confirmation a été envoyé à ${order.customerEmail}.` : ' Un e-mail de confirmation va arriver.'}<br />
            Livraison sous 10–14 jours ouvrés.
          </p>
        </div>

        {/* Order recap */}
        {order && items.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>

            {/* Items */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
                Articles commandés
              </p>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #F9FAFB',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: '#374151' }}>
                    {item.productName}
                    {item.size && <span style={{ color: '#9CA3AF' }}> — {item.size}</span>}
                    <span style={{ color: '#9CA3AF' }}> ×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: '#111827', flexShrink: 0 }}>
                    {formatPrice(item.priceEur * item.quantity)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                <span>Total payé</span>
                <span>{formatPrice(order.totalEur)}</span>
              </div>
            </div>

            {/* Shipping address */}
            {address && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                  Adresse de livraison
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: 1.7 }}>
                  {[address.line1, address.line2, `${address.postal_code ?? ''} ${address.city ?? ''}`.trim(), address.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {/* Order ref */}
            <div style={{ padding: '14px 24px', background: '#FAFAFA' }}>
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                Réf. commande : <code style={{ fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>{order.id.slice(0, 20)}…</code>
              </span>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="btn btn--primary">
            Retour à la boutique
          </Link>
        </div>

      </div>
    </main>
  )
}
