import type { ReactNode } from 'react'
import SupplierSidebar from './SupplierSidebar'
import SupplierProviders from './SupplierProviders'
import { requireSupplierPage } from '@/lib/supplier-page-guard'

export const metadata = { title: 'NEED SPORT — Espace Fournisseur' }

export default async function SupplierLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: gate every supplier segment server-side. Login/register
  // live outside this route group, so there is no redirect loop.
  await requireSupplierPage()

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#F7F8FA',
      }}
    >
      <SupplierSidebar />
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', minWidth: 0 }}>
        <SupplierProviders>
          {children}
        </SupplierProviders>
      </main>
    </div>
  )
}
