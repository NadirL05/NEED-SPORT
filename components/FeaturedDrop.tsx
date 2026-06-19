'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'
import { FROM_PRICE_CENTS } from '@/lib/pricing'

const BADGES: Record<string, { label: string; className: string }> = {
  'psg-home-2026':  { label: 'Nouveau',       className: 'card-badge new'      },
  'arg-copa-edit':  { label: 'Édition limitée', className: 'card-badge'        },
  'italie-heritage':{ label: 'Heritage',       className: 'card-badge heritage' },
}

export default function FeaturedDrop({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <section className="sec" id="drop">
      <div className="wrap">
        <div className="sec-head">
          <div className="left">
            <span className="caption caption--accent">Featured Drop</span>
            <h2>Sélection</h2>
          </div>
          <div className="right">
            <a href="#shop" data-cursor>Voir tout <span className="arr">→</span></a>
          </div>
        </div>

        <div className="featured-grid">
          {products.map((product) => {
            const badge = BADGES[product.id]
            return (
              <article key={product.id} className="card" data-cursor>
                <Link href={`/products/${product.id}`} className="card-media" tabIndex={-1} aria-hidden="true">
                  {badge && <span className={badge.className}>{badge.label}</span>}
                  <Image
                    src={product.img}
                    alt={`${product.club} — ${product.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    className="btn btn--ghost btn--sm card-take"
                    onClick={(e) => { e.preventDefault(); addItem(product) }}
                    aria-label={`Ajouter ${product.club} ${product.name} au panier`}
                  >
                    Prendre le maillot →
                  </button>
                </Link>
                <div className="card-info">
                  <span className="card-club">{product.club}</span>
                  <Link href={`/products/${product.id}`} className="card-name">{product.name}</Link>
                  <div className="card-row">
                    <span className="card-price">dès {(FROM_PRICE_CENTS / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                    <Link href={`/products/${product.id}`} className="card-link">Détails →</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
