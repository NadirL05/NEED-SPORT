'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { primaryImg } from '@/lib/product-images'

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
  const badge = resolveBadge(product)

  return (
    <article className="prc">
      <Link href={`/products/${product.id}`} className="prc-img-wrap" tabIndex={-1}>
        {badge && (
          <span className={`prc-badge prc-badge--${badge.variant}`}>{badge.label}</span>
        )}
        <Image
          src={primaryImg(product.img)}
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
          <span className="prc-price">dès {fmt(product.priceEur)}</span>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="prc-add prc-choose"
          aria-label={`Commander ${product.name}`}
        >
          Commander
        </Link>
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
  nationProducts?: Product[]
}

export default function ProductRail({
  title,
  subtitle,
  kicker,
  products,
  viewAllHref = '/shop',
  nationProducts,
}: Props) {
  const railRef  = useRef<HTMLDivElement>(null)
  const tabsId = useId()
  const [activeCategory, setActiveCategory] = useState<'clubs' | 'nations'>('clubs')
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

  const hasCategorySwitch = Boolean(nationProducts?.length)
  const visibleProducts = activeCategory === 'nations' && nationProducts?.length
    ? nationProducts
    : products
  const activeViewAllHref = hasCategorySwitch
    ? `/collections/${activeCategory}`
    : viewAllHref

  const selectCategory = (category: 'clubs' | 'nations') => {
    setActiveCategory(category)
    if (railRef.current) railRef.current.scrollLeft = 0
  }

  if (!visibleProducts.length) return null

  return (
    <section className="prl-sec">
      <div className="prl-head reveal">
        {kicker   && <p className="prl-kicker">{kicker}</p>}
        <h2 className="prl-title display">{title}</h2>
        {subtitle && <p className="prl-subtitle">{subtitle}</p>}
        {hasCategorySwitch && (
          <div className="prl-tabs" role="tablist" aria-label="Type de maillots">
            {(['clubs', 'nations'] as const).map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${category}`}
                aria-selected={activeCategory === category}
                aria-controls={`${tabsId}-products`}
                className={`prl-tab${activeCategory === category ? ' active' : ''}`}
                onClick={() => selectCategory(category)}
              >
                {category === 'clubs' ? 'Clubs' : 'Nations'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        id={`${tabsId}-products`}
        className="prl-scroll"
        ref={railRef}
        role={hasCategorySwitch ? 'tabpanel' : undefined}
        aria-labelledby={hasCategorySwitch ? `${tabsId}-tab-${activeCategory}` : undefined}
        onMouseDown={onDown}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onMouseMove={onMove}
      >
        {visibleProducts.map((p) => <Card key={p.id} product={p} />)}
      </div>

      <div className="prl-footer reveal">
        <Link href={activeViewAllHref} className="prl-see-all">Voir tout →</Link>
      </div>
    </section>
  )
}
