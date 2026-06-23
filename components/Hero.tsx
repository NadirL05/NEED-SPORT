'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

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
        <h1 className="hero-headline">Explorez nos maillots</h1>
        <div className="hero-review-mark" aria-label="Avis clients : 4,9 sur 5">
          <span className="hero-review-stars" aria-hidden="true">★★★★★</span>
          <span className="hero-review-score">4,9/5 · Avis vérifiés</span>
        </div>
        <p className="hero-review-signature">Offrez-vous l’excellence</p>
      </div>
    </section>
  )
}
