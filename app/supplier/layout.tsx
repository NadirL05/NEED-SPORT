import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata = { title: 'NEED SPORT — Espace Fournisseur' }

const NAV = [
  { href: '/supplier',          label: 'Dashboard',  icon: '▦' },
  { href: '/supplier/orders',   label: 'Commandes',  icon: '◎' },
  { href: '/supplier/products', label: 'Mes produits', icon: '◈' },
]

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0f172a', color: '#fff', flexShrink: 0,
        display: 'flex', flexDirection: 'column', padding: '0',
      }}>
        {/* Brand */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', color: '#fff' }}>NEED SPORT</div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.18em', marginTop: 3 }}>ESPACE FOURNISSEUR</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 24px', color: 'rgba(255,255,255,0.65)',
              textDecoration: 'none', fontSize: '0.87rem', transition: 'color 0.15s',
            }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <a href="/" style={{ color: '#475569', fontSize: '0.78rem', textDecoration: 'none', display: 'block', marginBottom: 10 }}>
            ← Voir la boutique
          </a>
          <form action="/api/supplier/auth/login" method="DELETE">
            <button
              type="submit"
              onClick={async (e) => {
                e.preventDefault()
                await fetch('/api/supplier/auth/login', { method: 'DELETE' })
                window.location.href = '/supplier/login'
              }}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', maxWidth: 1200 }}>
        {children}
      </main>
    </div>
  )
}
