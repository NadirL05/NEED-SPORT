'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/lib/db/schema'

export default function SupplierProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<Record<string, number>>({})
  const [saving, setSaving]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/supplier/products')
      .then(r => r.json() as Promise<Product[]>)
      .then(d => { setProducts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function saveStock(productId: string) {
    const stock = editing[productId]
    if (stock === undefined) return
    setSaving(productId)
    const res = await fetch(`/api/supplier/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    setSaving(null)
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock } : p))
      setEditing(prev => { const n = { ...prev }; delete n[productId]; return n })
    }
  }

  const stockColor = (s: number) => s === 0 ? '#ef4444' : s < 10 ? '#f59e0b' : '#10b981'

  return (
    <div>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Mes produits</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 36 }}>
        Gérez les stocks de votre catalogue — {products.length} produit{products.length > 1 ? 's' : ''}.
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement…</p>
      ) : products.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Aucun produit assigné à votre compte.<br />
          <span style={{ fontSize: '0.85rem' }}>Contactez l&apos;équipe NEED SPORT pour associer vos produits.</span>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 120px 100px', gap: 16, padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            {['', 'Produit', 'Club', 'Prix', 'Stock', 'Action'].map(h => (
              <div key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>

          {products.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 120px 100px', gap: 16, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
              {/* Image */}
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f1f5f9', overflow: 'hidden' }}>
                {p.img && <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>

              {/* Name */}
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{p.id}</div>
              </div>

              {/* Club */}
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>{p.club}</div>

              {/* Price */}
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                {(p.priceEur / 100).toFixed(2)} €
              </div>

              {/* Stock */}
              <div>
                <input
                  type="number"
                  min="0"
                  value={editing[p.id] ?? p.stock}
                  onChange={e => setEditing(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: 80, padding: '6px 10px', borderRadius: 7,
                    border: `1.5px solid ${stockColor(editing[p.id] ?? p.stock)}`,
                    fontSize: '0.88rem', color: '#0f172a', outline: 'none',
                  }}
                />
              </div>

              {/* Save */}
              <div>
                {editing[p.id] !== undefined ? (
                  <button
                    onClick={() => saveStock(p.id)}
                    disabled={saving === p.id}
                    style={{ padding: '6px 14px', borderRadius: 7, background: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {saving === p.id ? '…' : 'Sauver'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: stockColor(p.stock), fontWeight: 600 }}>
                    {p.stock === 0 ? 'Rupture' : p.stock < 10 ? 'Stock bas' : 'OK'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
