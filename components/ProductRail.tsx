'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'

type BadgeVariant = 'promo' | 'cdm' | 'limited'

function fmt(cents: number): string {
  const e = cents / 100
  return e % 1 === 0 ? `${e}€` : `${e.toFixed(2).replace('.', ',')}€`
}

function resolveBadge(p: Product): { label: string; variant: BadgeVariant } | null {
  const cats = p.cat ?? []
  if (cats.includes('limited'))  return { label: 'Limitée',  variant: 'limited' }
  if (cats.includes('cdm2026'))  return { label: 'CDM 2026', variant: 'cdm'     }
  if (p.compareAtPriceEur)       return { label: 'Promo',    variant: 'promo'   }
  return null
}

function Card({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const badge = resolveBadge(product)

  const handleAdd = useCallback(() => {
    addItem(product, 'M')
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }, [addItem, product])

  return (
    <article className="prc">
      <Link href={`/products/${product.id}`} className="prc-img-wrap" tabIndex={-1}>
        {badge && (
          <span className={`prc-badge prc-badge--${badge.variant}`}>{badge.label}</span>
        )}
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width:768px) 60vw, 220px"
          className="prc-img"
          style={{ objectFit: 'cover' }}
        />
      </Link>
      <div className="prc-body">
        <p className="prc-club">{product.club}</p>
        <Link href={`/products/${product.id}`} className="prc-name">{product.name}</Link>
        <div className="prc-price-row">
          <span className="prc-price">{fmt(product.priceEur)}</span>
          {product.compareAtPriceEur && (
            <span className="prc-compare">{fmt(product.compareAtPriceEur)}</span>
          )}
        </div>
        <button
          className={`prc-add${added ? ' prc-add--done' : ''}`}
          aria-label={`Ajouter ${product.name} au panier`}
          onClick={handleAdd}
        >
          {added ? '✓ Ajouté' : 'Ajouter au panier'}
        </button>
      </div>
    </article>
  )
}

interface Props {
  title: string
  subtitle?: string
  kicker?: string
  products: Product[]
  viewAllHref?: string
}

export default function ProductRail({ title, subtitle, kicker, products, viewAllHref = '/shop' }: Props) {
  const railRef  = useRef<HTMLDivElement>(null)
  const pressing = useRef(false)
  const startX   = useRef(0)
  const scrollL  = useRef(0)

  const onDown  = (e: React.MouseEvent) => {
    pressing.current = true
    startX.current   = e.pageX - (railRef.current?.offsetLeft ?? 0)
    scrollL.current  = railRef.current?.scrollLeft ?? 0
    railRef.current?.classList.add('grabbing')
  }
  const onUp    = () => { pressing.current = false; railRef.current?.classList.remove('grabbing') }
  const onMove  = (e: React.MouseEvent) => {
    if (!pressing.current || !railRef.current) return
    e.preventDefault()
    const x = e.pageX - railRef.current.offsetLeft
    railRef.current.scrollLeft = scrollL.current - (x - startX.current) * 1.5
  }

  if (!products.length) return null

  return (
    <section className="prl-sec">
      <div className="prl-head reveal">
        {kicker   && <p className="prl-kicker">{kicker}</p>}
        <h2 className="prl-title display">{title}</h2>
        {subtitle && <p className="prl-subtitle">{subtitle}</p>}
      </div>

      <div
        className="prl-scroll"
        ref={railRef}
        onMouseDown={onDown}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onMouseMove={onMove}
      >
        {products.map((p) => <Card key={p.id} product={p} />)}
      </div>

      <div className="prl-footer reveal">
        <Link href={viewAllHref} className="prl-see-all">Tout afficher →</Link>
      </div>
    </section>
  )
}
