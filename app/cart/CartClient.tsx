'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function CartClient() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const subtotalCents = items.reduce((sum, i) => sum + i.priceEur * i.quantity, 0)
  const fmt = (cents: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  const handleCheckout = async () => {
    if (!items.length || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, quantity, size }) => ({ id, quantity, size })),
        }),
      })
      const { url } = (await res.json()) as { url: string }
      if (url) window.location.href = url
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
          <Link href="/#shop" className="btn btn--primary">Découvrir la collection →</Link>
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
              {items.map((item) => {
                const key = `${item.id}__${item.size ?? ''}`
                return (
                  <div key={key} className="cart-item">
                    <Link href={`/products/${item.id}`} className="cart-thumb">
                      <Image
                        src={item.img}
                        alt={`${item.club} — ${item.name}`}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="cart-item-info">
                      <span className="cart-item-club">{item.club}</span>
                      <Link href={`/products/${item.id}`} className="cart-item-name">{item.name}</Link>
                      {item.size && <span className="cart-item-size">Taille : {item.size}</span>}
                    </div>
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        aria-label="Diminuer la quantité"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-price">{fmt(item.priceEur * item.quantity)}</span>
                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.id, item.size)}
                      aria-label={`Supprimer ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>

            <aside className="cart-summary">
              <h2 className="cart-summary-title">Récapitulatif</h2>
              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Sous-total</span>
                  <span>{fmt(subtotalCents)}</span>
                </div>
                <div className="cart-summary-row cart-summary-shipping">
                  <span>Livraison</span>
                  <span className="cart-free">Gratuite</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <span>{fmt(subtotalCents)}</span>
                </div>
              </div>
              <button
                className="btn btn--primary cart-checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Redirection…' : 'Passer la commande →'}
              </button>
              <Link href="/#shop" className="btn btn--ghost cart-continue-btn">
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
