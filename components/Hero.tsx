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

  const particles = [
    { dur: '9s',  delay: '0s',    drift: '18px'  },
    { dur: '7s',  delay: '1.2s',  drift: '-22px' },
    { dur: '11s', delay: '0.4s',  drift: '35px'  },
    { dur: '8s',  delay: '2.5s',  drift: '-14px' },
    { dur: '13s', delay: '0.9s',  drift: '28px'  },
    { dur: '6s',  delay: '3.1s',  drift: '-40px' },
    { dur: '10s', delay: '1.7s',  drift: '12px'  },
    { dur: '8.5s',delay: '4.2s',  drift: '-30px' },
    { dur: '12s', delay: '2.0s',  drift: '44px'  },
    { dur: '7.5s',delay: '0.6s',  drift: '-18px' },
    { dur: '9.5s',delay: '3.8s',  drift: '26px'  },
    { dur: '11s', delay: '1.4s',  drift: '-36px' },
  ]

  return (
    <section className="hero">
      <div className="hero-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            className="hero-particle"
            style={{
              left: `${8 + i * 7.5}%`,
              ['--p-dur' as string]: p.dur,
              ['--p-delay' as string]: p.delay,
              ['--p-drift' as string]: p.drift,
            }}
          />
        ))}
      </div>
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
