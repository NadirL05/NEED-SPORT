'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CATALOG, type Product } from '@/lib/catalog'
import { useCartStore } from '@/lib/store'

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'clubs',   label: 'Clubs' },
  { key: 'nations', label: 'Nations' },
  { key: 'limited', label: 'Limited' },
  { key: 'vintage', label: 'Vintage' },
]

function ShopCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  /* 3D tilt */
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const fine   = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    let raf: number
    const MAX = 5

    const onMove = (e: PointerEvent) => {
      const r  = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width  - 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateY(-3px)`
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
  }, [])

  const handleAdd = () => {
    if (added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="shop-card" ref={cardRef} data-cursor>
      <Link href={`/products/${product.id}`} className="shop-media" tabIndex={-1} aria-hidden="true">
        <Image
          src={product.img}
          alt={`${product.club} — ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
        <div className="shop-card-overlay" aria-hidden="true"><span>VOIR</span></div>
      </Link>
      <div className="shop-info">
        <Link href={`/products/${product.id}`} className="shop-info-link">
          <span className="club">{product.club}</span>
          <span className="name">{product.name}</span>
        </Link>
        <div className="row">
          <span className="price">{product.price}</span>
          <button
            className={`add${added ? ' added' : ''}`}
            data-cursor
            aria-label="Ajouter au panier"
            onClick={handleAdd}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function ShopSection() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = activeFilter === 'all'
    ? CATALOG
    : CATALOG.filter((p) => p.cat.includes(activeFilter))

  const [featured, ...rest] = visible

  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <div className="sec-head">
          <div className="left">
            <span className="caption caption--accent">Shop</span>
            <h2>Le catalogue</h2>
          </div>
          <div className="right">
            <a href="#" data-cursor>Tous les filtres <span className="arr">→</span></a>
          </div>
        </div>

        <div className="filters" role="tablist" aria-label="Filtrer la collection">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className="filter"
              data-cursor
              aria-pressed={activeFilter === key}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {featured && (
          <Link href={`/products/${featured.id}`} className="shop-featured">
            <div className="shop-featured-media">
              <Image
                src={featured.img}
                alt={`${featured.club} — ${featured.name}`}
                fill
                sizes="100vw"
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="shop-featured-overlay" />
            <div className="shop-card-overlay" aria-hidden="true"><span>VOIR</span></div>
            <div className="shop-featured-info">
              <p className="eyebrow">{featured.club}</p>
              <h3 className="shop-featured-name">{featured.name}</h3>
              <p className="shop-featured-price">{featured.price}</p>
            </div>
          </Link>
        )}

        <div className="shop-grid">
          {rest.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
