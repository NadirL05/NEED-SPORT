'use client'

import { useEffect, useRef } from 'react'

const STATS = [
  { label: 'Tissu officiel', target: 100, suffix: '%', sub: 'Polyester recyclé · Certifié' },
  { label: 'Livraison',      target: 48,  suffix: 'H', sub: 'France métropolitaine'        },
  { label: 'Authenticité',   target: 100, suffix: '%', sub: 'Maillots officiels uniquement' },
]

function useCountUp(target: number, duration = 1500) {
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        if (reduce) { el.textContent = String(target); return }
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = String(Math.round(target * eased))
          if (t < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return numRef
}

function StatCard({ label, target, suffix, sub }: typeof STATS[number]) {
  const numRef = useCountUp(target)
  return (
    <div className="pstat">
      <span className="lbl">{label}</span>
      <span className="num">
        <span ref={numRef}>0</span>
        <span className="accent">{suffix}</span>
      </span>
      <span className="sub">{sub}</span>
    </div>
  )
}

export default function PitchSection() {
  return (
    <section className="pitch-sec" id="terrain">
      <div className="pitch-bg" aria-hidden="true">
        <div className="pitch-stage">
          <svg className="pitch-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.05)" />
                <stop offset="40%"  stopColor="rgba(255,255,255,0.32)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.42)" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#lineFade)" strokeWidth="2" strokeLinecap="square">
              <rect x="20"  y="20" width="960" height="560" />
              <line x1="500" y1="20" x2="500" y2="580" />
              <circle cx="500" cy="300" r="72" />
              <rect x="20"  y="160" width="140" height="280" />
              <rect x="20"  y="230" width="50"  height="140" />
              <path d="M 160 248 A 72 72 0 0 1 160 352" />
              <rect x="840" y="160" width="140" height="280" />
              <rect x="930" y="230" width="50"  height="140" />
              <path d="M 840 248 A 72 72 0 0 0 840 352" />
              <path d="M 20 32 A 12 12 0 0 1 32 20" />
              <path d="M 968 20 A 12 12 0 0 1 980 32" />
              <path d="M 20 568 A 12 12 0 0 0 32 580" />
              <path d="M 968 580 A 12 12 0 0 0 980 568" />
            </g>
            <circle cx="500" cy="300" r="4"  fill="#00C2FF" />
            <circle cx="500" cy="300" r="10" fill="none" stroke="rgba(0,194,255,0.5)" strokeWidth="1" />
            <circle cx="110" cy="300" r="3"  fill="rgba(255,255,255,0.6)" />
            <circle cx="890" cy="300" r="3"  fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
      </div>

      <div className="wrap pitch-content">
        <div className="sec-head reveal">
          <div className="left">
            <span className="caption caption--accent">Manifeste</span>
            <h2>Le terrain<br />ne ment pas.</h2>
          </div>
          <div className="right">
            <a href="#france" data-cursor>Le drop France <span className="arr">→</span></a>
          </div>
        </div>

        <div className="pitch-stats">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  )
}
