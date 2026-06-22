'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { FROM_PRICE_CENTS } from '@/lib/pricing'

export default function ImmersiveSection({ product, imageSrc = '/hero-dark.jpg' }: { product: Product | null; imageSrc?: string }) {

  return (
    <section className="immersive" id="france">
      <div className="immersive-media">
        <Image
          src={imageSrc}
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
              À partir de {(FROM_PRICE_CENTS / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
          )}
          <div className="immersive-ctas">
            <Link
              className="btn btn--primary"
              data-cursor
              href={product ? `/products/${product.id}` : '/shop'}
            >
              Choisir la taille
            </Link>
            <a href="#shop" className="btn btn--ghost" data-cursor>Voir la fiche ↗</a>
          </div>
        </div>
      </div>
    </section>
  )
}
