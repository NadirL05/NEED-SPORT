'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'

export default function Nav() {
  const [scrolled,   setScrolled]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const total = useCartStore((s) => s.total)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
            aria-label="Ouvrir le menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          <span className="nav-lang" aria-label="Langue : Français">🇫🇷 FR</span>
        </div>

        <Link href="/" className="nav-brand-c" aria-label="NEED SPORT accueil">
          <span className="nav-brand-c-name">MAILLO.</span>
          <span className="nav-brand-c-sub">NEED SPORT</span>
        </Link>

        <nav className="nav-end" aria-label="Principale">
          <Link href="/shop"    className="nav-link-c">SHOP</Link>
          <Link href="/account" className="nav-link-c">COMPTE</Link>
          <Link href="/cart"    className="nav-link-c nav-cart-c" aria-label={`Panier — ${total} article${total !== 1 ? 's' : ''}`}>
            PANIER
            <span className={`nav-cart-bubble${total > 0 ? ' show' : ''}`} aria-hidden="true">{total}</span>
          </Link>
        </nav>
      </header>

      <div className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen} aria-label="Menu mobile">
        <Link href="/shop"                  onClick={() => setDrawerOpen(false)}>Shop          <small>→</small></Link>
        <Link href="/collections/clubs"     onClick={() => setDrawerOpen(false)}>Clubs         <small>→</small></Link>
        <Link href="/collections/nations"   onClick={() => setDrawerOpen(false)}>Nations       <small>→</small></Link>
        <Link href="/collections/limited"   onClick={() => setDrawerOpen(false)}>Éditions lim. <small>→</small></Link>
        <Link href="/about"                 onClick={() => setDrawerOpen(false)}>À propos      <small>→</small></Link>
        <div className="drawer-cta">
          <Link href="/shop" className="btn btn--primary" onClick={() => setDrawerOpen(false)}>
            Explorer la collection →
          </Link>
        </div>
      </div>
    </>
  )
}
