'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'

interface Props {
  title: string
  kicker?: string
  products: Product[]
  viewAllHref?: string
}

export default function ProductRail({ title, kicker, products, viewAllHref = '/shop' }: Props) {
  const railRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const onDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - rail.offsetLeft
      scrollLeft = rail.scrollLeft
      rail.classList.add('grabbing')
    }
    const onUp = () => {
      isDown = false
      rail.classList.remove('grabbing')
    }
    const onMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - rail.offsetLeft
      rail.scrollLeft = scrollLeft - (x - startX) * 1.5
    }

    rail.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    rail.addEventListener('mousemove', onMove)
    return () => {
      rail.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      rail.removeEventListener('mousemove', onMove)
    }
  }, [])

  function handleAdd(product: Product) {
    addItem(product, 'M')
    setAdded((prev) => new Set(prev).add(product.id))
    setTimeout(
      () => setAdded((prev) => { const n = new Set(prev); n.delete(product.id); return n }),
      1400
    )
  }

  if (!products.length) return null

  return (
    <section className="rail-sec reveal">
      <div className="rail-head">
        <div className="rail-head-left">
          {kicker && <p className="rail-kicker">{kicker}</p>}
          <h2 className="rail-title">{title}</h2>
        </div>
        <Link href={viewAllHref} className="rail-link">Voir tout →</Link>
      </div>

      <div className="rail-scroll" ref={railRef}>
        {products.map((p) => (
          <div key={p.id} className="rail-card gc">
            <Link href={`/products/${p.id}`} className="gc-media" tabIndex={-1}>
              <Image
                src={p.img}
                alt={p.name}
                fill
                sizes="220px"
                style={{ objectFit: 'cover' }}
              />
              {p.compareAtPriceEur && (
                <span className="gc-badge gc-badge--cyan">PROMO</span>
              )}
            </Link>
            <div className="gc-foot">
              <Link href={`/products/${p.id}`} className="gc-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="gc-club">{p.club}</span>
                <span className="gc-name">{p.name}</span>
                <div className="gc-price-row">
                  <span className="gc-price">{p.priceEur}€</span>
                  {p.compareAtPriceEur && (
                    <span className="gc-price-orig">{p.compareAtPriceEur}€</span>
                  )}
                </div>
              </Link>
              <button
                className={`gc-add${added.has(p.id) ? ' gc-added' : ''}`}
                aria-label={`Ajouter ${p.name} au panier`}
                onClick={() => handleAdd(p)}
              >
                {added.has(p.id) ? '✓' : '+'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
