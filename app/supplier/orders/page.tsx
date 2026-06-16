'use client'

import { useEffect, useState } from 'react'
import type { Order, OrderItem } from '@/lib/db/schema'

type OrderWithItems = Order & { items: OrderItem[] }

const STATUS_COLOR: Record<string, string> = {
  paid:      '#3b82f6',
  pending:   '#f59e0b',
  shipped:   '#10b981',
  delivered: '#8b5cf6',
  cancelled: '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Payée', pending: 'En attente', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}

export default function SupplierOrders() {
  const [orders, setOrders]   = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/supplier/orders')
      .then(r => r.json() as Promise<OrderWithItems[]>)
      .then(d => { setOrders(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Mes commandes</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 36 }}>
        Commandes contenant vos produits — {orders.length} au total.
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement…</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Aucune commande pour l&apos;instant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map(o => (
            <div key={o.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {/* Row */}
              <div
                style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 32px', alignItems: 'center', padding: '16px 22px', cursor: 'pointer', gap: 12 }}
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              >
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: '#64748b' }}>{o.id.slice(0, 18)}…</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>{o.customerName ?? '—'}</div>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>{o.customerEmail ?? '—'}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {(o.items.reduce((s, i) => s + i.priceEur * i.quantity, 0) / 100).toFixed(2)} €
                </div>
                <div>
                  <span style={{
                    background: (STATUS_COLOR[o.status] ?? '#94a3b8') + '18',
                    color: STATUS_COLOR[o.status] ?? '#94a3b8',
                    padding: '4px 12px', borderRadius: 100, fontSize: '0.74rem', fontWeight: 600,
                  }}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div style={{ color: '#cbd5e1' }}>{expanded === o.id ? '▲' : '▼'}</div>
              </div>

              {/* Detail */}
              {expanded === o.id && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '20px 22px', background: '#f8fafc' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                    <div>
                      <div style={sectionTitle}>Vos articles dans cette commande</div>
                      {o.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                          <span style={{ color: '#334155' }}>{item.productName}{item.size ? ` — ${item.size}` : ''} ×{item.quantity}</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{(item.priceEur * item.quantity / 100).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                    {o.shippingAddress && (
                      <div>
                        <div style={sectionTitle}>Adresse de livraison</div>
                        <pre style={{ fontSize: '0.82rem', color: '#475569', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'system-ui' }}>{o.shippingAddress}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: '0.73rem', fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
}
