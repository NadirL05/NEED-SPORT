'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '@/lib/db/schema'
import { useToastStore } from '../toast-store'
import { primaryImg } from '@/lib/product-images'

type StockLevel = 'ok' | 'low' | 'out'

function stockLevel(stock: number): StockLevel {
  if (stock === 0) return 'out'
  if (stock < 10) return 'low'
  return 'ok'
}

const STOCK_CONFIG: Record<StockLevel, { label: string; bg: string; color: string; bar: string }> = {
  ok:  { label: 'En stock',  bg: '#D1FAE5', color: '#065F46', bar: '#059669' },
  low: { label: 'Stock bas', bg: '#FEF3C7', color: '#92400E', bar: '#D97706' },
  out: { label: 'Rupture',   bg: '#FEE2E2', color: '#991B1B', bar: '#DC2626' },
}

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'low', label: 'Stock bas' },
  { key: 'out', label: 'Rupture' },
]

export default function SupplierProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<Record<string, number>>({})
  const [saving, setSaving]     = useState<string | null>(null)
  const [filter, setFilter]     = useState('all')
  const toast = useToastStore()

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
      toast.add('Stock mis à jour.', 'success')
    } else {
      toast.add('Impossible de sauvegarder.', 'error')
    }
  }

  const criticalCount = useMemo(
    () => products.filter(p => p.stock < 10).length,
    [products],
  )

  const visible = useMemo(() => {
    if (filter === 'all') return products
    if (filter === 'low') return products.filter(p => p.stock > 0 && p.stock < 10)
    if (filter === 'out') return products.filter(p => p.stock === 0)
    return products
  }, [products, filter])

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Mes produits
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
          {loading
            ? 'Chargement…'
            : `${products.length} produit${products.length !== 1 ? 's' : ''} dans votre catalogue.`}
        </p>
      </header>

      {/* Low stock alert */}
      <AnimatePresence>
        {!loading && criticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M8 2L14.5 13H1.5L8 2z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 6.5v3M8 11.25h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400E' }}>
              <strong>{criticalCount} produit{criticalCount > 1 ? 's' : ''}</strong> nécessitent une mise à jour de stock.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter pills */}
      {!loading && products.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTERS.map(f => {
            const active = filter === f.key
            const count = f.key === 'all'
              ? products.length
              : f.key === 'low'
                ? products.filter(p => p.stock > 0 && p.stock < 10).length
                : products.filter(p => p.stock === 0).length

            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: active ? '1.5px solid #111827' : '1.5px solid #E5E7EB',
                  background: active ? '#111827' : '#fff',
                  color: active ? '#fff' : '#374151',
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
                {count > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                    color: active ? '#fff' : '#6B7280',
                    borderRadius: 100,
                    padding: '1px 7px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                height: 76,
                borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState />
      ) : visible.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: '#374151', fontWeight: 500, marginBottom: 4 }}>Aucun produit dans cette catégorie.</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>
            <button onClick={() => setFilter('all')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>
              Voir tous les produits
            </button>
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {/* Column header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr 140px 100px 220px 120px',
              gap: 16,
              padding: '11px 20px',
              background: '#FAFAFA',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            {['', 'Produit', 'Club', 'Prix', 'Stock', ''].map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {visible.map((p, idx) => (
            <ProductRow
              key={p.id}
              product={p}
              index={idx}
              isLast={idx === visible.length - 1}
              editValue={editing[p.id]}
              isSaving={saving === p.id}
              onEdit={val => setEditing(prev => ({ ...prev, [p.id]: val }))}
              onSave={() => saveStock(p.id)}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

function ProductRow({
  product,
  index,
  isLast,
  editValue,
  isSaving,
  onEdit,
  onSave,
}: {
  product: Product
  index: number
  isLast: boolean
  editValue: number | undefined
  isSaving: boolean
  onEdit: (val: number) => void
  onSave: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const currentStock = editValue ?? product.stock
  const level = stockLevel(currentStock)
  const cfg = STOCK_CONFIG[level]
  const isDirty = editValue !== undefined
  const pct = Math.min(currentStock / 50, 1) * 100

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr 140px 100px 220px 120px',
        gap: 16,
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
        background: hovered ? '#F9FAFB' : '#fff',
        transition: 'background 0.12s',
        animation: `rowIn 0.3s ease both ${index * 35}ms`,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {product.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImg(product.img)}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Name */}
      <div>
        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{product.name}</div>
        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>
          {product.id.slice(0, 20)}&hellip;
        </div>
      </div>

      {/* Club */}
      <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{product.club}</div>

      {/* Price */}
      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
        {(product.priceEur / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </div>

      {/* Stock editor + progress bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <input
            type="number"
            min="0"
            value={currentStock}
            onChange={e => onEdit(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: 76,
              padding: '7px 10px',
              borderRadius: 7,
              border: `1.5px solid ${isDirty ? '#111827' : '#E5E7EB'}`,
              fontSize: '0.875rem',
              color: '#111827',
              outline: 'none',
              background: '#fff',
              transition: 'border-color 0.15s',
            }}
            aria-label={`Stock de ${product.name}`}
          />
          <span
            style={{
              display: 'inline-block',
              background: cfg.bg,
              color: cfg.color,
              padding: '4px 9px',
              borderRadius: 100,
              fontSize: '0.72rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.label}
          </span>
        </div>
        {/* Stock progress bar */}
        <div
          style={{
            height: 3,
            background: '#F3F4F6',
            borderRadius: 99,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: cfg.bar,
              borderRadius: 99,
              transition: 'width 0.3s ease, background 0.2s',
            }}
          />
        </div>
      </div>

      {/* Save action */}
      <div>
        {isDirty ? (
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: '7px 16px',
              borderRadius: 7,
              background: '#111827',
              color: '#fff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.65 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isSaving ? '…' : 'Sauvegarder'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 16px', display: 'block' }} aria-hidden="true">
        <path d="M20 3L36 12v16L20 37 4 28V12L20 3z" stroke="#E5E7EB" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 3v34M4 12l16 9 16-9" stroke="#E5E7EB" strokeWidth="2" />
      </svg>
      <p style={{ color: '#374151', fontWeight: 500, marginBottom: 6 }}>
        Aucun produit assigné à votre compte.
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>
        Contactez l&apos;équipe NeedFoot pour associer vos produits.
      </p>
    </div>
  )
}
