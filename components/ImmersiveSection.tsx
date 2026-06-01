'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'

export default function ImmersiveSection({ product }: { product: Product | null }) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <section className="immersive" id="france">
      <div className="immersive-media">
        <Image
          src="/hero-dark.jpg"
          alt="Athlète silhouette"
          fill
          sizes="100vw"
          loading="lazy"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
      <div className="immersive-overlay" />

      <div className="hud-stats" aria-hidden="true">
        <div className="hud-stat">
          <span className="hud-label">VITESSE PIC</span>
          <span className="hud-value">34.2 KM/H</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">TISSU</span>
          <span className="hud-value">DRYFIT PRO</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">CERTIFIÉ</span>
          <span className="hud-value">FIFA</span>
        </div>
      </div>

      <div className="wrap">
        <div className="immersive-content reveal">
          <div className="lbl">★ Drop exclusif · Quantités limitées</div>
          <h2>
            <span>France</span>
            <span className="yr">2026</span>
          </h2>
          <p className="immersive-quote">« Taillé pour les 90 minutes. Fait pour durer une vie. »</p>
          <div className="specs">
            <span className="spec">100% Polyester</span>
            <span className="spec">DryFit</span>
            <span className="spec">Coupe authentique</span>
          </div>
          {product && (
            <div className="immersive-price">
              {(product.priceEur / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
          )}
          <div className="immersive-ctas">
            <button
              className="btn btn--primary"
              data-cursor
              onClick={() => product && addItem(product)}
            >
              Prendre le maillot
            </button>
            <a href="#shop" className="btn btn--ghost" data-cursor>Voir la fiche ↗</a>
          </div>
        </div>
      </div>
    </section>
  )
}
