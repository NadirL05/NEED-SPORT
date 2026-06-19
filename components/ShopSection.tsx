'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { useCartStore } from '@/lib/store'
import { FROM_PRICE_CENTS } from '@/lib/pricing'

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

function Card({ product, hero = false, delay = 0 }: { product: Product; hero?: boolean; delay?: number }) {
  const addItem  = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const badge     = getBadge(product)
  const salePrice = (FROM_PRICE_CENTS / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
  const origPrice = (Math.ceil(FROM_PRICE_CENTS * 1.22 / 500) * 5).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <article
      ref={cardRef}
      className={`ms2-card reveal${hero ? ' ms2-card--hero' : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      <Link href={`/products/${product.id}`} className="ms2-card-link">
        <Image
          src={product.img}
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
            <span className="ms2-sale">dès {salePrice}</span>
            <span className="ms2-orig">{origPrice}</span>
          </div>
        </div>
      </Link>
      <button
        className={`ms2-add${added ? ' ms2-added' : ''}`}
        aria-label="Ajouter au panier"
        onClick={handleAdd}
      >
        {added ? '✓' : '+'}
      </button>
    </article>
  )
}

export default function ShopSection({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = activeFilter === 'all'
    ? products
    : products.filter((p) => p.cat.includes(activeFilter))

  return (
    <section className="ms2-section" id="shop">
      <div className="ms2-head reveal">
        <h2 className="ms2-heading">Nos Maillots</h2>
        <p className="ms2-sub">
          {products.length} références &middot; Clubs &middot; Nations &middot; Éditions Limitées
        </p>
      </div>

      <div className="ms2-filter-row reveal" role="tablist" aria-label="Filtrer par catégorie">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeFilter === key}
            className={`ms2-filter${activeFilter === key ? ' active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

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

      <div className="ms2-footer-bar reveal">
        <span className="ms2-trust-item">Livraison offerte dès 50€</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">Retour gratuit 30 jours</span>
        <span className="ms2-trust-dot" />
        <span className="ms2-trust-item">1 750 avis ★★★★★</span>
      </div>
    </section>
  )
}
