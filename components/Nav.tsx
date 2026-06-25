'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'

export default function Nav() {
  const [scrolled,   setScrolled]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const total = useCartStore((s) => s.total)

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > 24
      setScrolled(s)
      document.body.classList.toggle('page-scrolled', s)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('drawer-open', drawerOpen)
  }, [drawerOpen])

  return (
    <>
      <header className={`nav nav--center${scrolled ? ' scrolled' : ''}`} id="nav">
        <div className="nav-start">
          <button
            className="hamburger"
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          <span className="nav-lang" aria-label="Langue : Français">🇫🇷 FR</span>
        </div>

        <Link href="/" className="nav-brand-c" aria-label="NEEDFOOT. accueil">
          <span className="nav-brand-c-name">NEEDFOOT.</span>
        </Link>

        <nav className="nav-end" aria-label="Principale">
          <Link href="/shop"    className="nav-link-c">SHOP</Link>
          <Link href="/contact" className="nav-link-c">AIDE</Link>
          <Link href="/cart"    className="nav-link-c nav-cart-c" aria-label={`Panier — ${total} article${total !== 1 ? 's' : ''}`}>
            PANIER
            <span className={`nav-cart-bubble${total > 0 ? ' show' : ''}`} aria-hidden="true">{total}</span>
          </Link>
        </nav>
      </header>

      <div
        className={`drawer-backdrop${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className={`drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu de navigation" aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <span className="drawer-brand">NEEDFOOT.</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fermer le menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className="drawer-nav">
          <Link href="/shop"                onClick={() => setDrawerOpen(false)}>Shop<span>→</span></Link>
          <Link href="/collections/clubs"   onClick={() => setDrawerOpen(false)}>Clubs<span>→</span></Link>
          <Link href="/collections/nations" onClick={() => setDrawerOpen(false)}>Nations<span>→</span></Link>
          <Link href="/collections/limited" onClick={() => setDrawerOpen(false)}>Éditions limitées<span>→</span></Link>
          <Link href="/about"               onClick={() => setDrawerOpen(false)}>À propos<span>→</span></Link>
          <Link href="/faq"                 onClick={() => setDrawerOpen(false)}>Aide &amp; FAQ<span>→</span></Link>
          <Link href="/contact"             onClick={() => setDrawerOpen(false)}>Contact<span>→</span></Link>
        </nav>

        <div className="drawer-cta">
          <Link href="/shop" className="btn btn--primary" onClick={() => setDrawerOpen(false)}>
            Explorer la collection →
          </Link>
        </div>
      </div>
    </>
  )
}
