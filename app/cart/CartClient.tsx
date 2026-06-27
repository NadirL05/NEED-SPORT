'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { optionsSummary, isVintageCat } from '@/lib/pricing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { primaryImg } from '@/lib/product-images'

export default function CartClient() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number } | null>(null)

  const subtotalCents = items.reduce((sum, i) => sum + i.priceEur * i.quantity, 0)
  const discountCents = appliedPromo ? Math.round(subtotalCents * appliedPromo.discountPct / 100) : 0
  const totalCents    = subtotalCents - discountCents
  const fmt = (cents: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoValidating(true)
    setPromoError('')
    const res = await fetch('/api/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoInput.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setPromoError(data.error ?? 'Code invalide')
      setAppliedPromo(null)
    } else {
      setAppliedPromo({ code: data.code, discountPct: data.discountPct })
      setPromoError('')
    }
    setPromoValidating(false)
  }

  const handleCheckout = async () => {
    if (!items.length || loading) return
    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, quantity, size, options }) => ({ id, quantity, size, options })),
          promoCode: appliedPromo?.code ?? null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Impossible de lancer le paiement.')
      }
      if (!data.url) {
        throw new Error('Impossible de lancer le paiement. Réessayez ou contactez-nous.')
      }
      window.location.href = data.url
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Impossible de lancer le paiement. Réessayez ou contactez-nous.')
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <>
        <Nav />
        <main className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h1 className="display">Panier vide.</h1>
          <p>Aucun maillot sélectionné pour l&apos;instant.</p>
          <Link href="/shop" className="btn btn--primary">Découvrir la collection →</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="cart-page">
        <div className="wrap">
          <div className="cart-header">
            <h1 className="display cart-title">
              Panier <span className="cart-count">{total}</span>
            </h1>
            <button className="cart-clear" onClick={clearCart}>Vider le panier</button>
          </div>

          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                  <div key={item.key} className="cart-item">
                    <Link href={`/products/${encodeURIComponent(item.id)}`} className="cart-thumb">
                      <Image
                        src={primaryImg(item.img)}
                        alt={`${item.club} — ${item.name}`}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="cart-item-info">
                      <span className="cart-item-club">{item.club}</span>
                      <Link href={`/products/${encodeURIComponent(item.id)}`} className="cart-item-name">{item.name}</Link>
                      <span className="cart-item-options">{optionsSummary(item.options, isVintageCat(item.cat))}</span>
                      {item.size && <span className="cart-item-size">Taille : {item.size}</span>}
                    </div>
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-price">{fmt(item.priceEur * item.quantity)}</span>
                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Supprimer ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2 className="cart-summary-title">Récapitulatif</h2>
              {/* Promo code */}
              <div className="cart-promo">
                {appliedPromo ? (
                  <div className="cart-promo-applied">
                    <span>🎉 Code <strong>{appliedPromo.code}</strong> appliqué — −{appliedPromo.discountPct}%</span>
                    <button onClick={() => { setAppliedPromo(null); setPromoInput('') }} className="cart-promo-remove">✕</button>
                  </div>
                ) : (
                  <div className="cart-promo-form">
                    <input
                      type="text"
                      className="cart-promo-input"
                      placeholder="Code promo"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <button className="cart-promo-btn" onClick={handleApplyPromo} disabled={promoValidating}>
                      {promoValidating ? '…' : 'Appliquer'}
                    </button>
                  </div>
                )}
                {promoError && <p className="cart-promo-error">{promoError}</p>}
              </div>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Sous-total</span>
                  <span>{fmt(subtotalCents)}</span>
                </div>
                {appliedPromo && (
                  <div className="cart-summary-row cart-summary-discount">
                    <span>Réduction ({appliedPromo.discountPct}%)</span>
                    <span className="cart-discount">−{fmt(discountCents)}</span>
                  </div>
                )}
                <div className="cart-summary-row cart-summary-shipping">
                  <span>Livraison</span>
                  <span className="cart-free">Gratuite</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <span>{fmt(totalCents)}</span>
                </div>
              </div>
              {checkoutError && (
                <div className="cart-checkout-error" role="alert">
                  {checkoutError} <Link href="/contact">Nous contacter</Link>
                </div>
              )}
              <button
                className="btn btn--primary cart-checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Redirection…' : 'Passer la commande →'}
              </button>
              <Link href="/shop" className="btn btn--ghost cart-continue-btn">
                Continuer mes achats
              </Link>
              <p className="cart-secure">🔒 Paiement sécurisé via Stripe</p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
