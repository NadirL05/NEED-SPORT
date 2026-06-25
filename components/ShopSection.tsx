'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { FROM_PRICE_CENTS } from '@/lib/pricing'
import { primaryImg } from '@/lib/product-images'
import { filterProducts } from '@/lib/product-search'

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'clubs',   label: 'Clubs' },
  { key: 'nations', label: 'Nations' },
  { key: 'limited', label: 'Édition Limitée' },
]

function getBadge(p: Product): { text: string; variant: string } | null {
  if (p.cat.includes('limited')) return { text: 'Limitée', variant: 'gold' }
  if (p.cat.includes('nations')) return { text: 'CdM 2026', variant: 'cyan' }
  return null
}

function Card({
  product,
  hero = false,
  eager = false,
  delay = 0,
}: {
  product: Product
  hero?: boolean
  eager?: boolean
  delay?: number
}) {
  const cardRef  = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el || !hero) return
    const fine   = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    let raf: number
    const onMove = (e: PointerEvent) => {
      const r  = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width  - 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1200px) rotateY(${px * 3}deg) rotateX(${-py * 3}deg)`
      })
    }
    const onLeave = () => { cancelAnimationFrame(raf); el.style.transform = '' }
    el.addEventListener('pointermove',  onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [hero])

  const badge     = getBadge(product)
  const salePrice = (FROM_PRICE_CENTS / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <article
      ref={cardRef}
      className={`ms2-card reveal${hero ? ' ms2-card--hero' : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      <Link href={`/products/${product.id}`} className="ms2-card-link">
        <Image
          src={primaryImg(product.img)}
          alt={`${product.club} — ${product.name}`}
          fill
          sizes={hero
            ? '(max-width: 768px) 100vw, 50vw'
            : '(max-width: 768px) 50vw, 25vw'}
          loading={eager ? 'eager' : 'lazy'}
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />
        <div className="ms2-overlay" />
        {badge && (
          <span className={`ms2-badge ms2-badge--${badge.variant}`}>{badge.text}</span>
        )}
        <div className="ms2-info">
          <span className="ms2-club">{product.club}</span>
          <span className="ms2-name">{product.name}</span>
          <div className="ms2-prices">
            <span className="ms2-sale">dès {salePrice}</span>
          </div>
        </div>
      </Link>
      <Link
        href={`/products/${product.id}`}
        className="ms2-add ms2-choose"
        aria-label={`Choisir la taille pour ${product.club} ${product.name}`}
      >
        Voir
      </Link>
    </article>
  )
}

export default function ShopSection({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(
    () => filterProducts(products, { query, category: activeFilter }),
    [activeFilter, products, query],
  )
  const resultLabel = `${visible.length} maillot${visible.length !== 1 ? 's' : ''}`

  return (
    <section className="ms2-section" id="shop">
      <div className="ms2-head reveal">
        <h1 className="ms2-heading">Nos Maillots</h1>
        <p className="ms2-sub">
          {products.length} références &middot; Clubs &middot; Nations &middot; Éditions Limitées
        </p>
      </div>

      <div className="ms2-discovery reveal">
        <label className="sr-only" htmlFor="shop-search">
          Rechercher un club ou un maillot
        </label>
        <div className="ms2-search">
          <svg
            className="ms2-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            ref={searchRef}
            id="shop-search"
            className="ms2-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher PSG, France, domicile…"
            autoComplete="off"
            aria-controls="shop-results"
          />
          {query && (
            <button
              type="button"
              className="ms2-search-clear"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
        <p
          className="ms2-result-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultLabel}
        </p>
      </div>

      <div
        className="ms2-filter-row reveal"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={activeFilter === key}
            className={`ms2-filter${activeFilter === key ? ' active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ms2-grid" id="shop-results">
        {visible.length > 0 ? (
          visible.map((product, i) => (
            <Card
              key={product.id}
              product={product}
              hero={visible.length > 2 && i === 0}
              eager={i < 4}
              delay={Math.min(i * 40, 360)}
            />
          ))
        ) : (
          <div className="ms2-empty">
            <p className="ms2-empty-title">Aucun maillot trouvé</p>
            <p className="ms2-empty-copy">
              Essaie un autre club ou affiche de nouveau toutes les collections.
            </p>
            <button
              type="button"
              className="ms2-empty-reset"
              onClick={() => {
                setQuery('')
                setActiveFilter('all')
                searchRef.current?.focus()
              }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      <div className="ms2-footer-bar reveal">
        <span className="ms2-trust-item">Livraison partout · 10–15 jours</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">Retours 14 jours</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">Paiement sécurisé</span>
      </div>
    </section>
  )
}
