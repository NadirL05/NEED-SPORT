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
          src="/immersive-bg.jpg"
          alt="Athlète en mouvement"
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-inner reveal">
        <p className="eyebrow">Maillots officiels — Livraison 48H</p>
        <h1 className="hero-title">NEED<br />SPORT</h1>
        <a href="#shop" className="btn btn--primary">Explorer →</a>
      </div>
    </section>
  )
}
