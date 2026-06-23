'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Hero({ imageSrc = '/hero-benzema-2.jpg' }: { imageSrc?: string }) {
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {
      const sy = Math.min(window.scrollY, window.innerHeight)
      // Keep the scale overscan (~5%) >= the parallax travel (5% of viewport)
      // so the portrait photo always fully covers the hero — never a gap.
      media.style.transform = `scale(1.1) translateY(${sy * 0.05}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero">
      <div className="hero-media" ref={mediaRef}>
        <Image
          src={imageSrc}
          alt="Benzema célébrant avec Al-Hilal — NEEDSPORT."
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-grain" aria-hidden="true" />

      <div className="hero-inner">
        <h1 className="hero-headline">
          <span>Porte tes</span>
          <span className="hero-headline-accent">couleurs.</span>
        </h1>
        <p className="hero-sub">
          Maillots clubs &amp; nations — floquage, patchs et livraison
          suivie partout. Du stade à la rue.
        </p>
        <div className="hero-actions">
          <Link href="/shop" className="hero-btn hero-btn--primary">
            Explorer la collection <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="hero-trust">
          <li>Livraison 10–15 jours</li>
          <li>Paiement sécurisé</li>
        </ul>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <span className="hero-scroll-label">SCROLL</span>
        <span className="hero-scroll-bar" />
      </div>
    </section>
  )
}
