import Link from 'next/link'
import { getOrders } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const STATUS_COLOR: Record<string, string> = {
  paid:      '#22c55e',
  pending:   '#f59e0b',
  shipped:   '#3b82f6',
  delivered: '#8b5cf6',
  cancelled: '#ef4444',
}

export default async function AdminDashboard() {
  const [orders, activeProducts] = await Promise.all([
    getOrders(),
    db.select().from(products).where(eq(products.active, true)),
  ])

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((acc, o) => acc + o.totalEur, 0)

  const recentOrders = orders.slice(0, 8)

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '32px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Commandes',  value: orders.length },
          { label: 'Produits actifs', value: activeProducts.length },
          { label: 'CA total',   value: `${(totalRevenue / 100).toFixed(2)} €` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Dernières commandes</h2>
          <Link href="/admin/orders" style={{ fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none' }}>Tout voir →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Aucune commande pour l&apos;instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {['ID', 'Email', 'Montant', 'Statut', 'Date'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '10px 0', fontFamily: 'monospace', fontSize: '0.78rem', color: '#555' }}>{o.id.slice(0, 16)}…</td>
                  <td style={{ padding: '10px 0' }}>{o.customerEmail ?? '—'}</td>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{(o.totalEur / 100).toFixed(2)} €</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{ background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status], padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', color: '#888' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
