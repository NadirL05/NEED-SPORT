import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin-page-guard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'NEEDSPORT. Admin' }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: gate every admin segment server-side, including client
  // pages (orders, nations, employees/new) that cannot run their own guard.
  // Login lives outside this route group, so there is no redirect loop.
  await requireAdminPage()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f4f4f5' }}>
      <aside style={{ width: '220px', background: '#0a0a0b', color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.06em' }}>NEEDSPORT.</div>
          <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '0.2em', marginTop: '2px' }}>ADMIN</div>
        </div>
        <nav style={{ padding: '20px 0', flex: 1 }}>
          {[
            { href: '/admin',            label: 'Dashboard' },
            { href: '/admin/products',   label: 'Produits' },
            { href: '/admin/orders',     label: 'Commandes' },
            { href: '/admin/nations',    label: 'Nations' },
            { href: '/admin/media',      label: 'Médias' },
            { href: '/admin/pages',      label: 'Pages' },
            { href: '/admin/employees',  label: 'Employés' },
            { href: '/admin/promo-codes', label: 'Codes promo' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', padding: '10px 24px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ color: '#666', fontSize: '0.78rem', textDecoration: 'none' }}>← Voir le site</Link>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
