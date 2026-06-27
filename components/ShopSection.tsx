'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { formatEur } from '@/lib/pricing'
import { primaryImg } from '@/lib/product-images'
import { filterProducts } from '@/lib/product-search'

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'clubs',   label: 'Clubs' },
  { key: 'nations', label: 'Nations' },
  { key: 'limited', label: 'Éd. Limitée' },
  { key: 'special', label: 'Spéciaux' },
]

function getBadge(p: Product): { text: string; variant: string } | null {
  if (p.cat.includes('limited')) return { text: 'Limitée', variant: 'gold' }
  if (p.cat.includes('nations')) return { text: 'CdM 2026', variant: 'cyan' }
  return null
}

function Card({ product, hero = false, delay = 0 }: { product: Product; hero?: boolean; delay?: number }) {
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el || !hero) return
    if (!window.requestAnimationFrame) return
    const fine   = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    let raf: number
    const onMove = (e: PointerEvent) => {
      const r  = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width  - 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        el.style.transform = `perspective(1200px) rotateY(${px * 3}deg) rotateX(${-py * 3}deg)`
      })
    }
    const onLeave = () => { window.cancelAnimationFrame(raf); el.style.transform = '' }
    el.addEventListener('pointermove',  onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.cancelAnimationFrame(raf)
    }
  }, [hero])

  const badge = getBadge(product)

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
          loading="lazy"
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
            <span className="ms2-sale">dès {formatEur(product.priceEur)}</span>
            {product.compareAtPriceEur && (
              <span className="ms2-orig">{formatEur(product.compareAtPriceEur)}</span>
            )}
          </div>
        </div>
      </Link>
      <Link
        href={`/products/${product.id}`}
        className="ms2-add ms2-choose"
        aria-label={`Commander ${product.club} ${product.name}`}
      >
        Commander
      </Link>
    </article>
  )
}

export default function ShopSection({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const visible = filterProducts(products, { query, category: activeFilter })
  const count = visible.length
  const countText = `${count} maillot${count !== 1 ? 's' : ''}`

  function reset() {
    setQuery('')
    setActiveFilter('all')
    searchRef.current?.focus()
  }

  function clearSearch() {
    setQuery('')
    searchRef.current?.focus()
  }

  return (
    <section className="ms2-section" id="shop">
      <div className="ms2-head">
        <h1 className="ms2-heading">Nos Maillots</h1>
        <p className="ms2-sub">
          {products.length} références &middot; Clubs &middot; Nations &middot; Éditions Limitées
        </p>
      </div>

      <div className="ms2-search-row">
        <input
          ref={searchRef}
          type="search"
          aria-label="Rechercher un club ou un maillot"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ms2-search"
          placeholder="Rechercher…"
        />
        {query && (
          <button type="button" className="ms2-search-clear" onClick={clearSearch}>
            Effacer la recherche
          </button>
        )}
      </div>

      <div role="group" aria-label="Filtrer par catégorie" className="ms2-filter-row">
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
        {(query || activeFilter !== 'all') && (
          <button type="button" className="ms2-filter-reset" onClick={reset}>
            Réinitialiser
          </button>
        )}
      </div>

      <div role="status" aria-live="polite" className="ms2-status">
        {countText}
      </div>

      {visible.length === 0 ? (
        <p className="ms2-empty">Aucun maillot trouvé</p>
      ) : (
        <div className="ms2-grid">
          {visible.map((product, i) => (
            <Card
              key={product.id}
              product={product}
              hero={i === 0}
              delay={Math.min(i * 40, 360)}
            />
          ))}
        </div>
      )}

      <div className="ms2-footer-bar reveal">
        <span className="ms2-trust-item">Livraison partout · 10–15 jours</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">Retours 14 jours</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">1 750 avis ★★★★★</span>
      </div>
    </section>
  )
}
