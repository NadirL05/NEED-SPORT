'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CATALOG, type Product } from '@/lib/catalog'
import { useCartStore } from '@/lib/store'

const FILTERS = [
  { key: 'all',     label: 'Tout' },
  { key: 'clubs',   label: 'Club' },
  { key: 'nations', label: 'Nation' },
  { key: 'limited', label: 'Limited' },
]

function GlassCard({ product, revealDelay = 0 }: { product: Product; revealDelay?: number }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
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
        el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg)`
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article
      className="gc reveal"
      ref={cardRef}
      style={{ '--reveal-delay': `${revealDelay}ms` } as React.CSSProperties}
    >
      <Link href={`/products/${product.id}`} className="gc-media">
        <Image
          src={product.img}
          alt={`${product.club} — ${product.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      </Link>
      <div className="gc-foot">
        <div className="gc-info">
          <span className="gc-club">{product.club}</span>
          <span className="gc-price">{product.price}</span>
        </div>
        <button
          className={`gc-add${added ? ' gc-added' : ''}`}
          aria-label="Ajouter au panier"
          onClick={handleAdd}
        >
          {added ? '✓' : '+'}
        </button>
      </div>
    </article>
  )
}

export default function ShopSection() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = activeFilter === 'all'
    ? CATALOG
    : CATALOG.filter((p) => p.cat.includes(activeFilter))

  return (
    <section className="maillo-shop" id="shop">
      <div className="ms-trust ms-trust--top reveal">
        <span className="ms-trust-item">+ Livraison offerte dès 50€ d&apos;achat</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Retour gratuit sous 30 jours</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ 1750 avis ★★★★★</span>
      </div>

      <div className="ms-head reveal">
        <div className="ms-filters" role="tablist" aria-label="Filtrer">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              className={`ms-filter${activeFilter === key ? ' active' : ''}`}
              aria-selected={activeFilter === key}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ms-grid">
        {visible.map((product, i) => (
          <GlassCard key={product.id} product={product} revealDelay={i * 50} />
        ))}
      </div>

      <div className="ms-trust ms-trust--bot reveal">
        <span className="ms-trust-item">+ Choisir en 60 secondes</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Livraison 48H garantie</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Paiement 100% sécurisé</span>
      </div>
    </section>
  )
}
