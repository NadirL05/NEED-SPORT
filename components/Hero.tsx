'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Hero() {
  const heroRef  = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLImageElement>(null)
  const dialRef  = useRef<HTMLDivElement>(null)
  const auroraRef= useRef<HTMLDivElement>(null)

  /* Word reveal on load */
  useEffect(() => {
    const start = () => heroRef.current?.classList.add('ready')
    if (document.readyState === 'complete') {
      requestAnimationFrame(start)
    } else {
      window.addEventListener('load', start, { once: true })
    }
  }, [])

  /* Hero parallax (mouse + scroll) */
  useEffect(() => {
    const hero   = heroRef.current
    const media  = mediaRef.current
    const dial   = dialRef.current
    const aurora = auroraRef.current
    if (!hero) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine   = window.matchMedia('(pointer: fine)').matches
    let mx = 0, my = 0, tx = 0, ty = 0, sy = 0
    let rafId: number

    if (!reduce && fine) {
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect()
        mx = (e.clientX - r.left) / r.width - 0.5
        my = (e.clientY - r.top)  / r.height - 0.5
      }
      hero.addEventListener('pointermove', onMove)
    }

    const onScroll = () => { sy = Math.min(window.scrollY, window.innerHeight) }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      tx += (mx - tx) * 0.08
      ty += (my - ty) * 0.08
      if (media)  media.style.transform  = `scale(1.06) translate3d(${tx * -18}px, ${ty * -18 + sy * 0.18}px, 0)`
      if (aurora) aurora.style.translate = `${tx * 30}px ${ty * 20}px`
      if (dial)   dial.style.translate   = `${tx * -30}px ${ty * -22 - sy * 0.2}px`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  /* Magnetic primary buttons */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine   = window.matchMedia('(pointer: fine)').matches
    if (reduce || !fine) return

    const buttons = document.querySelectorAll<HTMLElement>('.btn--primary')
    const cleanups: (() => void)[] = []

    buttons.forEach((btn) => {
      let raf: number
      btn.style.transition = 'transform .35s var(--ease-out), background .3s var(--ease)'

      const onMove = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width  / 2) / r.width
        const y = (e.clientY - r.top  - r.height / 2) / r.height
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => { btn.style.transform = `translate(${x * 10}px, ${y * 7}px)` })
      }
      const onLeave = () => { cancelAnimationFrame(raf); btn.style.transform = '' }

      btn.addEventListener('pointermove',  onMove)
      btn.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        btn.removeEventListener('pointermove',  onMove)
        btn.removeEventListener('pointerleave', onLeave)
        cancelAnimationFrame(raf)
      })
    })
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-media">
        <Image
          ref={mediaRef}
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=2400&q=80"
          alt="Athlète en mouvement"
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-aurora"   ref={auroraRef} aria-hidden="true" />

      <div className="dial" ref={dialRef} aria-hidden="true">
        <svg viewBox="-100 -100 200 200">
          <defs>
            <linearGradient id="dialFade" x1="0" y1="-1" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(0,194,255,.9)" />
              <stop offset="100%" stopColor="rgba(0,194,255,.1)" />
            </linearGradient>
          </defs>
          <circle r="96" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
          <g className="ring-spin" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1">
            <circle r="78" />
            <g strokeWidth="1.2">
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
                <line key={deg} x1="0" y1="-78" x2="0" y2="-72" transform={`rotate(${deg})`} />
              ))}
            </g>
          </g>
          <circle className="tick-arc" r="60" fill="none" stroke="url(#dialFade)" strokeWidth="2" strokeDasharray="565" strokeDashoffset="400" strokeLinecap="round" transform="rotate(-90)" />
          <g className="ring-counter" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1">
            <circle r="42" />
            <line x1="-42" y1="0" x2="42" y2="0" />
            <line x1="0" y1="-42" x2="0" y2="42" />
          </g>
          <circle r="3" fill="#00C2FF" />
          <circle r="7" fill="none" stroke="rgba(0,194,255,.5)" strokeWidth="1" />
        </svg>
      </div>

      <div className="hero-scan" aria-hidden="true" />

      <div className="hero-inner">
        <div className="eyebrow">Nouvelle collection 2026</div>
        <h1>
          <span className="hline" style={{ '--d': '0.15s' } as React.CSSProperties}>
            <span className="hword">Porte</span>
          </span>
          <span className="hline" style={{ '--d': '0.32s' } as React.CSSProperties}>
            <span className="hword">ce qu&apos;ils</span>
          </span>
          <span className="hline" style={{ '--d': '0.5s' } as React.CSSProperties}>
            <span className="hword">portent<span className="punct">.</span></span>
          </span>
        </h1>
        <p className="hero-sub">
          Les maillots des plus grands clubs et nations du monde. Coupes authentiques, tissus officiels, livraison sous 48h.
        </p>
        <div className="hero-ctas">
          <a href="#shop" className="btn btn--primary" data-cursor>Explorer la collection</a>
          <a href="#drop" className="btn btn--ghost"   data-cursor>Voir le drop ↗</a>
        </div>
      </div>

      <div className="scroll-ind" aria-hidden="true">Défiler</div>
    </section>
  )
}
