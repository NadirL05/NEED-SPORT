import type { ReactNode } from 'react'
import Link from 'next/link'
import EmployeeLogoutButton from './LogoutButton'
import { requireEmployeePage } from '@/lib/employee-page-guard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'NEED SPORT — Espace Employé' }

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: gate every employee segment server-side. Login lives
  // outside this route group, so there is no redirect loop.
  await requireEmployeePage()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f4f4f5' }}>
      <aside style={{ width: '220px', background: '#0f172a', color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '28px 0' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.06em' }}>NEED SPORT</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.2em', marginTop: '2px' }}>EMPLOYÉ</div>
        </div>
        <nav style={{ padding: '20px 0', flex: 1 }}>
          {[
            { href: '/employee/products', label: 'Catalogue produits' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', padding: '10px 24px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.88rem' }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/" style={{ color: '#64748b', fontSize: '0.78rem', textDecoration: 'none' }}>← Voir le site</Link>
          <EmployeeLogoutButton />
        </div>
      </aside>
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
