'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
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
      <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
        <a href="#" className="brand" data-cursor>
          <span className="brand-mark" />
          <span className="brand-text">
            <span className="brand-main">MAILLO.</span>
            <span className="brand-sub">NEED SPORT</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="Principale">
          <a href="#shop" className="nav-link" aria-current="true" data-cursor>Shop</a>

          <MegaItem label="Clubs">
            <div className="mega-grid">
              <MegaCol title="Ligue 1" links={['Paris Saint-Germain','Olympique de Marseille','AS Monaco','Olympique Lyonnais']} />
              <MegaCol title="Premier League" links={['Manchester City','Arsenal','Liverpool','Chelsea']} />
              <MegaCol title="LaLiga · Serie A" links={['Real Madrid','FC Barcelona','Inter Milan','Juventus']} />
            </div>
            <div className="mega-promo">
              <div><div className="ll">Drop · Décembre</div><div className="tt">Maillots third 2026</div></div>
              <Link href="/collections/clubs" className="go">Voir →</Link>
            </div>
          </MegaItem>

          <MegaItem label="Nations">
            <div className="mega-grid">
              <MegaCol title="Europe"    links={['France','Angleterre','Allemagne','Italie']} />
              <MegaCol title="Amériques" links={['Argentine','Brésil','Uruguay','Mexique']} />
              <MegaCol title="Afrique"   links={["Sénégal","Maroc","Côte d'Ivoire","Nigéria"]} />
            </div>
            <div className="mega-promo">
              <div><div className="ll">Coupe du Monde 2026</div><div className="tt">Précommandes ouvertes</div></div>
              <Link href="/collections/nations" className="go">Voir →</Link>
            </div>
          </MegaItem>

          <Link href="/collections/limited" className="nav-link" data-cursor>Limited</Link>
          <Link href="/collections/nations" className="nav-link" data-cursor>Drops</Link>
        </nav>

        <div className="nav-right">
          <Link href="/cart" className="cart-btn" data-cursor aria-label="Panier">
            <svg viewBox="0 0 24 24"><path d="M5 7h14l-1.4 11.2A2 2 0 0 1 15.6 20H8.4a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
            <span className={`cart-badge${total > 0 ? ' show' : ''}`}>{total}</span>
          </Link>
          <a href="#shop" className="btn btn--primary btn--sm" data-cursor>Explorer →</a>
          <button className="hamburger" aria-label="Menu" onClick={() => setDrawerOpen((v) => !v)}>
            <span />
          </button>
        </div>
      </header>

      <div className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        <a href="/#shop"                     onClick={() => setDrawerOpen(false)}>Shop      <small>34</small></a>
        <Link href="/collections/clubs"    onClick={() => setDrawerOpen(false)}>Clubs     <small>→</small></Link>
        <Link href="/collections/nations"  onClick={() => setDrawerOpen(false)}>Nations   <small>→</small></Link>
        <Link href="/collections/limited"  onClick={() => setDrawerOpen(false)}>Limited   <small>12</small></Link>
        <Link href="/about"                onClick={() => setDrawerOpen(false)}>À propos  <small>→</small></Link>
        <div className="drawer-cta">
          <a href="#shop" className="btn btn--primary" onClick={() => setDrawerOpen(false)}>
            Explorer la collection →
          </a>
        </div>
      </div>
    </>
  )
}

function MegaItem({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout>
    const openMenu  = () => { clearTimeout(timer); setOpen(true) }
    const closeMenu = (delay = 120) => { timer = setTimeout(() => setOpen(false), delay) }
    el.addEventListener('mouseenter', openMenu)
    el.addEventListener('mouseleave', () => closeMenu())
    el.addEventListener('focusin',    openMenu)
    el.addEventListener('focusout',   (e) => { if (!el.contains((e as FocusEvent).relatedTarget as Node)) closeMenu(0) })
    return () => {
      el.removeEventListener('mouseenter', openMenu)
      el.removeEventListener('mouseleave', () => closeMenu())
      el.removeEventListener('focusin', openMenu)
      el.removeEventListener('focusout', () => closeMenu(0))
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`nav-item${open ? ' open' : ''}`} ref={ref}>
      <button className="nav-link" aria-expanded={open} data-cursor>
        {label} <span className="caret" />
      </button>
      <div className="mega" role="menu">{children}</div>
    </div>
  )
}

function MegaCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="mega-col">
      <h4>{title}</h4>
      <ul>{links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
    </div>
  )
}
