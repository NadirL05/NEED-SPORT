import Link from 'next/link'
import ProductForm from '../ProductForm'
import { requireAdminPage } from '@/lib/admin-page-guard'

export default async function NewProduct() {
  await requireAdminPage()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/admin/products" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>← Produits</Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Nouveau produit</h1>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <ProductForm />
      </div>
    </div>
  )
}
