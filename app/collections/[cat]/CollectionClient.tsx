'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'
import { formatEur } from '@/lib/pricing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { primaryImg } from '@/lib/product-images'

interface CollectionClientProps {
  cat: string
  label: string
  description: string
  products: Product[]
}

function CollectionCard({ product }: { product: Product }) {
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
    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }

    el.addEventListener('pointermove',  onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove',  onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <article className="shop-card" ref={cardRef} data-cursor>
      <div className="shop-media" style={{ position: 'relative' }}>
        <Link href={`/products/${encodeURIComponent(product.id)}`} tabIndex={-1} aria-hidden="true" style={{ display: 'block', position: 'absolute', inset: 0 }}>
          <Image
            src={primaryImg(product.img)}
            alt={`${product.club} — ${product.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </div>
      <div className="shop-info">
        <Link href={`/products/${encodeURIComponent(product.id)}`} className="shop-info-link">
          <span className="club">{product.club}</span>
          <span className="name">{product.name}</span>
        </Link>
        <div className="row">
          <span className="price">dès {formatEur(product.priceEur)}</span>
          <Link
            href={`/products/${encodeURIComponent(product.id)}`}
            className="add add--choose"
            data-cursor
            aria-label={`Choisir la taille pour ${product.club} ${product.name}`}
          >
            Voir
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function CollectionClient({ label, description, products }: CollectionClientProps) {
  return (
    <>
      <Nav />

      <main>
        {/* Page header */}
        <section className="sec" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            {/* Breadcrumb */}
            <nav
              aria-label="Fil d'Ariane"
              style={{
                display: 'flex',
                gap: '8px',
                fontSize: '.7rem',
                color: 'var(--text-2)',
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                marginBottom: '32px',
                alignItems: 'center',
              }}
            >
              <Link
                href="/"
                style={{ color: 'var(--text-2)', textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)' }}
              >
                Accueil
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/shop"
                style={{ color: 'var(--text-2)', textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)' }}
              >
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span style={{ color: 'var(--text)' }}>{label}</span>
            </nav>

            {/* Heading */}
            <h1
              className="display"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 9rem)', marginBottom: '18px' }}
            >
              {label}
            </h1>

            <p
              style={{
                color: 'var(--text-2)',
                fontSize: '1rem',
                maxWidth: '520px',
                lineHeight: 1.55,
                marginBottom: '14px',
              }}
            >
              {description}
            </p>

            <span className="caption">
              {products.length} maillot{products.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>

        {/* Product grid */}
        <section className="sec">
          <div className="wrap">
            {products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 0',
                  color: 'var(--text-2)',
                  fontSize: '1rem',
                  letterSpacing: '0.06em',
                }}
              >
                Aucun maillot dans cette collection pour le moment.
              </div>
            ) : (
              <div className="shop-grid">
                {products.map((product) => (
                  <CollectionCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
