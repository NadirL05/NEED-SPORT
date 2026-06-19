import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getAllSuppliers } from '@/lib/db/queries'
import ProductForm from '../ProductForm'
import { requireAdminPage } from '@/lib/admin-page-guard'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage()

  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()
  const suppliers = await getAllSuppliers()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/admin/products" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>← Produits</Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Éditer — {product.club} {product.name}</h1>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <ProductForm product={product} suppliers={suppliers.map((s) => ({ id: s.id, companyName: s.companyName }))} />
      </div>
    </div>
  )
}
