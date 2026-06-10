'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { useCartStore } from '@/lib/store'

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'clubs',   label: 'Clubs' },
  { key: 'nations', label: 'Nations' },
  { key: 'limited', label: 'Édition Limitée' },
]

function getBadge(product: Product): { text: string; cls: string } | null {
  if (product.cat.includes('limited')) return { text: 'Édition Limitée', cls: 'gc-badge--gold' }
  if (product.cat.includes('nations')) return { text: 'CdM 2026', cls: 'gc-badge--cyan' }
  return null
}

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

  const badge = getBadge(product)
  const salePrice = (product.priceEur / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
  const origPrice = (Math.ceil(product.priceEur * 1.22 / 500) * 5).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <article
      className="gc reveal"
      ref={cardRef}
      style={{ '--reveal-delay': `${revealDelay}ms` } as React.CSSProperties}
    >
      <Link href={`/products/${product.id}`} className="gc-media">
        {badge && <span className={`gc-badge ${badge.cls}`}>{badge.text}</span>}
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
          <span className="gc-name">{product.name}</span>
          <div className="gc-price-row">
            <span className="gc-price">{salePrice}</span>
            <span className="gc-price-orig">{origPrice}</span>
          </div>
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

export default function ShopSection({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let isDown = false, startX = 0, scrollLeft = 0
    const onDown = (e: MouseEvent) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft }
    const onUp   = () => { isDown = false }
    const onMove = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) }
    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
    }
  }, [])

  const visible = activeFilter === 'all'
    ? products
    : products.filter((p) => p.cat.includes(activeFilter))

  return (
    <section className="maillo-shop" id="shop">
      <div className="ms-trust ms-trust--top reveal">
        <span className="ms-trust-item">+ Livraison offerte dès 50€ d&apos;achat</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Retour gratuit sous 30 jours</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ 1750 avis ★★★★★</span>
      </div>

      <h2 className="ms-title reveal">Nos Maillots</h2>

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

      <div className="ms-scroll" ref={scrollRef}>
        {visible.map((product, i) => (
          <GlassCard key={product.id} product={product} revealDelay={i * 50} />
        ))}
      </div>

      <div className="ms-trust ms-trust--bot reveal">
        <span className="ms-trust-item">+ Choisir en 60 secondes</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Livraison 10-14 jours</span>
        <span className="ms-trust-sep" />
        <span className="ms-trust-item">+ Paiement 100% sécurisé</span>
      </div>
    </section>
  )
}
