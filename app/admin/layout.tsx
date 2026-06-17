import type { ReactNode } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'NEEDFOOT. Admin' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f4f4f5' }}>
      <aside style={{ width: '220px', background: '#0a0a0b', color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.06em' }}>NEEDFOOT.</div>
          <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '0.2em', marginTop: '2px' }}>ADMIN</div>
        </div>
        <nav style={{ padding: '20px 0', flex: 1 }}>
          {[
            { href: '/admin',            label: 'Dashboard' },
            { href: '/admin/products',   label: 'Produits' },
            { href: '/admin/orders',     label: 'Commandes' },
            { href: '/admin/pages',      label: 'Pages' },
            { href: '/admin/employees',  label: 'Employés' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', padding: '10px 24px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" style={{ color: '#666', fontSize: '0.78rem', textDecoration: 'none' }}>← Voir le site</a>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
