'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const onScroll = () => {
      const sy = Math.min(window.scrollY, window.innerHeight)
      media.style.transform = `scale(1.06) translateY(${sy * 0.2}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero">
      <div className="hero-media" ref={mediaRef}>
        <Image
          src="/hero-maillo.jpg"
          alt="Maillot officiel — Real Madrid & Équipe de France"
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-inner reveal">
        <p className="hero-eyebrow">Maillots officiels authentiques</p>
        <h1 className="hero-display">MAILLO.</h1>
        <p className="hero-tagline">Clubs & sélections. Livraison 48h.</p>
        <a href="/shop" className="btn btn--ghost hero-cta-btn">Explorer la collection →</a>
      </div>
    </section>
  )
}
