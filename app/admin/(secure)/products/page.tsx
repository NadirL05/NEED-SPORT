import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin-page-guard'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { primaryImg } from '@/lib/product-images'

export default async function AdminProducts() {
  await requireAdminPage()

  const rows = await db.select().from(products).orderBy(products.createdAt)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Produits</h1>
        <Link href="/admin/products/new" style={{ background: '#0a0a0b', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
          + Nouveau produit
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ background: '#fafafa' }}>
            <tr>
              {['Image', 'Club', 'Nom', 'Prix', 'Stock', 'Catégories', 'Actif', 'Actions', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  {p.img ? (
                    <Link href={`/products/${encodeURIComponent(p.id)}`} target="_blank" rel="noopener noreferrer" title="Voir sur le site" style={{ display: 'inline-block', lineHeight: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={primaryImg(p.img)} alt={p.name} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '6px' }} />
                    </Link>
                  ) : null}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.club}</td>
                <td style={{ padding: '12px 16px' }}>{p.name}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{(p.priceEur / 100).toFixed(2)} €</td>
                <td style={{ padding: '12px 16px' }}>{p.stock}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{p.cat.join(', ')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: p.active ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{p.active ? '✓' : '✗'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/products/${p.id}`} style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}>Éditer</Link>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/products/${encodeURIComponent(p.id)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '0.82rem' }}>Voir ↗</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
