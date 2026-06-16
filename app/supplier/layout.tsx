import type { ReactNode } from 'react'
import SupplierSidebar from './SupplierSidebar'
import SupplierProviders from './SupplierProviders'

export const metadata = { title: 'NEED SPORT — Espace Fournisseur' }

export default function SupplierLayout({ children }: { children: ReactNode }) {
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
