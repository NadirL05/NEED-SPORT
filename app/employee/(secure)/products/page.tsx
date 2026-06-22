import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'

export default async function EmployeeProductsPage() {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token || !(await verifyEmployeeToken(token))) redirect('/employee/login')

  const rows = await db.select().from(products).orderBy(products.createdAt)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Catalogue produits</h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.88rem' }}>{rows.length} produit{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/employee/products/new"
          style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
        >
          + Nouveau produit
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e4e4e7' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e4e4e7', background: '#fafafa' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Produit</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Club</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#555' }}>Prix</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#555' }}>Stock</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#555' }}>Statut</th>
              <th style={{ padding: '12px 16px' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{p.club}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {(p.priceEur / 100).toFixed(2)} €
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: p.stock < 10 ? '#f59e0b' : '#666' }}>
                  {p.stock}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600,
                    background: p.active ? '#dcfce7' : '#fee2e2',
                    color: p.active ? '#166534' : '#991b1b',
                  }}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <Link href={`/employee/products/${p.id}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 500, fontSize: '0.82rem' }}>
                    Modifier →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
            Aucun produit. <Link href="/employee/products/new" style={{ color: '#0f172a' }}>Créez le premier.</Link>
          </div>
        )}
      </div>
    </div>
  )
}
