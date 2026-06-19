'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

type NavItem = { href: string; label: string; exact?: boolean; icon: React.ReactNode }

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6h6M5 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5L14 5v6L8 14.5 2 11V5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 1.5v13M2 5l6 3.5L14 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const NAV: NavItem[] = [
  { href: '/supplier',          label: 'Dashboard',    icon: <DashboardIcon />, exact: true },
  { href: '/supplier/orders',   label: 'Commandes',    icon: <OrdersIcon /> },
  { href: '/supplier/products', label: 'Mes produits', icon: <ProductsIcon /> },
]

export default function SupplierSidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  return (
    <aside
      style={{
        width: 240,
        background: '#0f172a',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 24px 22px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.13em', color: '#fff' }}>
          NEED SPORT
        </div>
        <div style={{ fontSize: '0.6rem', color: '#475569', letterSpacing: '0.2em', marginTop: 4 }}>
          ESPACE FOURNISSEUR
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px 0' }} aria-label="Navigation principale">
        {NAV.map(item => {
          const active = isActive(item)
          const isHovered = hovered === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 2,
                color: active ? '#fff' : isHovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                background: active
                  ? 'rgba(255,255,255,0.11)'
                  : isHovered
                    ? 'rgba(255,255,255,0.05)'
                    : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ padding: '16px 24px 24px' }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#475569',
            fontSize: '0.8rem',
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 6H4M4 6l2.5-2.5M4 6l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voir la boutique
        </a>
        <LogoutButton />
      </div>
    </aside>
  )
}
