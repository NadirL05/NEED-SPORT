'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store'

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function IconShop() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}

function IconCart({ count }: { count: number }) {
  return (
    <span className="bn-icon-wrap">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {count > 0 && <span className="bn-badge">{count > 9 ? '9+' : count}</span>}
    </span>
  )
}

function IconAccount() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const total = useCartStore((s) => s.total)

  const links = [
    { href: '/',        label: 'Accueil', icon: <IconHome /> },
    { href: '/shop',    label: 'Shop',    icon: <IconShop /> },
    { href: '/cart',    label: 'Panier',  icon: <IconCart count={total} /> },
    { href: '/account', label: 'Compte',  icon: <IconAccount /> },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {links.map(({ href, label, icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`bn-item${isActive ? ' bn-item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {icon}
            <span className="bn-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
