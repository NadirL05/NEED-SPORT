'use client'

import { useState } from 'react'
import '../orders.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  productName: string
  size: string | null
  quantity: number
  priceEur: number
}

interface Order {
  id: string
  status: 'paid' | 'shipped' | 'delivered'
  totalEur: number
  originalTotalEur: number | null
  promoCode: string | null
  discountEur: number | null
  customerName: string | null
  shippingAddress: string | null
  createdAt: string
  items: OrderItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type StatusKey = Order['status']

const STATUS_LABELS: Record<StatusKey, string> = {
  paid: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
}

function StatusBadge({ status }: { status: StatusKey }) {
  return (
    <span className={`ord-badge ord-badge--${status}`}>
      {status === 'delivered' && (
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Email gate ───────────────────────────────────────────────────────────────

interface EmailGateProps {
  orderId: string
  onVerified: (order: Order) => void
}

function EmailGate({ orderId, onVerified }: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(email)}`,
      )
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 401) setError('Email non reconnu pour cette commande.')
        else if (res.status === 404) setError('Commande introuvable.')
        else if (res.status === 429) setError('Trop de tentatives. Merci de réessayer dans quelques minutes.')
        else setError(json.error ?? 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      onVerified(json.order as Order)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const shortRef = orderId.length > 12 ? `#${orderId.slice(0, 12)}…` : `#${orderId}`

  return (
    <div className="ord-root">
      <header className="ord-header">
        <span className="ord-brand">NEEDFOOT.</span>
      </header>

      <main className="ord-main">
        <div className="ord-stack">
          <div className="ord-card">
            <div className="ord-form-head">
              <div className="ord-icon-wrap">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="ord-form-title">Vérification</h1>
                <p className="ord-ref-mono" style={{ color: '#A09B97' }}>{shortRef}</p>
              </div>
            </div>

            <p className="ord-verify-desc">
              Pour accéder à votre commande, entrez l&rsquo;email utilisé lors de l&rsquo;achat.
            </p>

            <div className="ord-divider" />

            <form onSubmit={handleSubmit} className="ord-form-body">
              <div>
                <label htmlFor="email" className="ord-label">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="ord-input"
                />
              </div>

              {error && (
                <div className="ord-error" role="alert">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    style={{ color: '#C0392B', flexShrink: 0, marginTop: 1 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="ord-error-text">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="ord-submit">
                {loading ? (
                  <span className="ord-submit-inner">
                    <span className="ord-spin" aria-hidden="true" />
                    Vérification…
                  </span>
                ) : (
                  'Voir ma commande →'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Order detail ─────────────────────────────────────────────────────────────

function OrderDetail({ order }: { order: Order }) {
  const hasDiscount =
    order.promoCode != null &&
    order.discountEur != null &&
    order.discountEur > 0 &&
    order.originalTotalEur != null

  const shortRef = `#${order.id.slice(0, 12)}`

  return (
    <div className="ord-root">
      <header className="ord-header">
        <span className="ord-brand">NEEDFOOT.</span>
        <span className="ord-ref-mono">{shortRef}</span>
      </header>

      <main className="ord-main">
        <div className="ord-stack">

          {/* Status card */}
          <div className="ord-card ord-card-pad">
            <div className="ord-status-row">
              <div>
                <p className="ord-eyebrow">Statut</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="ord-date-block">
                Commandé le<br />
                <span className="ord-date-val">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Items card */}
          <div className="ord-card">
            <div className="ord-items-head">
              <p className="ord-eyebrow">Articles</p>
            </div>
            <ul className="ord-items-list">
              {order.items.map((item, idx) => {
                const label = item.size ? `${item.productName} — ${item.size}` : item.productName
                const lineTotal = item.priceEur * item.quantity
                return (
                  <li key={idx} className="ord-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="ord-item-name">{label}</p>
                      {item.quantity > 1 && (
                        <p className="ord-item-qty">
                          {formatPrice(item.priceEur)} × {item.quantity}
                        </p>
                      )}
                    </div>
                    <span className="ord-item-price">{formatPrice(lineTotal)}</span>
                  </li>
                )
              })}
            </ul>

            <div className="ord-totals">
              {hasDiscount && order.originalTotalEur != null && (
                <>
                  <div className="ord-total-row">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.originalTotalEur)}</span>
                  </div>
                  <div className="ord-total-row ord-total-row--discount">
                    <span>Remise ({order.promoCode})</span>
                    <span>−{formatPrice(order.discountEur!)}</span>
                  </div>
                </>
              )}
              <div className="ord-total-row ord-total-row--final">
                <span>Total</span>
                <span>{formatPrice(order.totalEur)}</span>
              </div>
            </div>
          </div>

          {/* Shipping card */}
          {order.shippingAddress && (
            <div className="ord-card ord-card-pad">
              <p className="ord-eyebrow" style={{ marginBottom: 10 }}>Adresse de livraison</p>
              <p className="ord-address">{order.shippingAddress}</p>
            </div>
          )}

          <p className="ord-note">Délais : préparation 3–4 jours, puis livraison 10–15 jours.</p>
        </div>
      </main>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)

  if (order) {
    return <OrderDetail order={order} />
  }

  return <EmailGate orderId={orderId} onVerified={setOrder} />
}
