'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { CATALOG } from '@/lib/catalog'

const PRODUCT = CATALOG.find((p) => p.id === 'france-home-2026')!

export default function ImmersiveSection() {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <section className="immersive" id="france">
      <div className="immersive-media">
        <Image
          src="https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=2400&q=80"
          alt="Atmosphère stade"
          fill
          sizes="100vw"
          loading="lazy"
          style={{ objectFit: 'cover' }}
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
        <div className="immersive-content">
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
          <div className="immersive-price">{PRODUCT.price}</div>
          <div className="immersive-ctas">
            <button
              className="btn btn--primary"
              data-cursor
              onClick={() => addItem(PRODUCT)}
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
