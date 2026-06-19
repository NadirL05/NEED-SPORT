'use client'

import { useEffect, useState } from 'react'
import type { Order, OrderItem } from '@/lib/db/schema'

type OrderWithItems = Order & { items: OrderItem[] }

const STATUS_COLOR: Record<string, string> = {
  paid:      '#22c55e',
  pending:   '#f59e0b',
  shipped:   '#3b82f6',
  delivered: '#8b5cf6',
  cancelled: '#ef4444',
}

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json() as Promise<OrderWithItems[]>)
      .then((data) => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '32px' }}>Commandes</h1>

      {loading ? (
        <p style={{ color: '#aaa' }}>Chargement…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#aaa' }}>Aucune commande pour l&apos;instant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div
                style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', gap: '12px' }}
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              >
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#555' }}>{o.id.slice(0, 20)}…</div>
                  <div style={{ fontSize: '0.82rem', color: '#888', marginTop: '2px' }}>{o.customerEmail ?? '—'}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{o.customerName ?? '—'}</div>
                <div style={{ fontWeight: 700 }}>{(o.totalEur / 100).toFixed(2)} €</div>
                <div>
                  <span style={{ background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status], padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {o.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#888' }}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{expanded === o.id ? '▲' : '▼'}</div>
              </div>

              {expanded === o.id && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Articles</h3>
                      {o.items.length === 0 ? (
                        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Aucun article enregistré</p>
                      ) : (
                        o.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                            <span>{item.productName} {item.size ? `(${item.size})` : ''} ×{item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{(item.priceEur * item.quantity / 100).toFixed(2)} €</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Changer le statut</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(o.id, s)}
                            style={{
                              padding: '6px 14px', borderRadius: '100px', border: '1px solid',
                              borderColor: o.status === s ? STATUS_COLOR[s] : '#e4e4e7',
                              background: o.status === s ? STATUS_COLOR[s] : '#fff',
                              color: o.status === s ? '#fff' : '#555',
                              fontSize: '0.78rem', cursor: 'pointer', fontWeight: o.status === s ? 600 : 400,
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {o.shippingAddress && (
                        <div style={{ marginTop: '16px' }}>
                          <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Adresse</h3>
                          <pre style={{ fontSize: '0.8rem', color: '#555', whiteSpace: 'pre-wrap' }}>{o.shippingAddress}</pre>
                        </div>
                      )}
                    </div>
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
