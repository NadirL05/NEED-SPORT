'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Order, OrderItem } from '@/lib/db/schema'

type OrderWithItems = Order & { items: OrderItem[] }

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  paid:      { label: 'Payée',      bg: '#DBEAFE', color: '#1E40AF' },
  shipped:   { label: 'Expédiée',   bg: '#EDE9FE', color: '#5B21B6' },
  delivered: { label: 'Livrée',     bg: '#D1FAE5', color: '#065F46' },
  cancelled: { label: 'Annulée',    bg: '#F3F4F6', color: '#374151' },
}

const FILTERS = [
  { key: 'all',       label: 'Toutes' },
  { key: 'pending',   label: 'En attente' },
  { key: 'paid',      label: 'Payées' },
  { key: 'shipped',   label: 'Expédiées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
]

function orderAmount(order: OrderWithItems) {
  return order.items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
}

export default function SupplierOrders() {
  const [orders, setOrders]   = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/supplier/orders')
      .then(r => r.json() as Promise<OrderWithItems[]>)
      .then(d => { setOrders(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () => filter === 'all' ? orders : orders.filter(o => o.status === filter),
    [orders, filter],
  )

  const countFor = (key: string) =>
    key === 'all' ? orders.length : orders.filter(o => o.status === key).length

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Mes commandes
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
          {loading ? 'Chargement…' : `${orders.length} commande${orders.length !== 1 ? 's' : ''} au total.`}
        </p>
      </header>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTERS.map(f => {
          const count = countFor(f.key)
          const active = filter === f.key
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
                <span
                  style={{
                    marginLeft: 6,
                    background: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                    color: active ? '#fff' : '#6B7280',
                    borderRadius: 100,
                    padding: '1px 7px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                height: 60,
                borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none',
                background: i % 2 === 0 ? '#FAFAFA' : '#fff',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 110px 140px 100px 36px',
              gap: 12,
              padding: '11px 20px',
              background: '#FAFAFA',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            {['Commande', 'Client', 'Montant', 'Statut', 'Date', ''].map(h => (
              <div
                key={h}
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

          {visible.map((o, idx) => (
            <OrderRow
              key={o.id}
              order={o}
              isExpanded={expanded === o.id}
              isLast={idx === visible.length - 1}
              onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

function OrderRow({
  order,
  isExpanded,
  isLast,
  onToggle,
}: {
  order: OrderWithItems
  isExpanded: boolean
  isLast: boolean
  onToggle: () => void
}) {
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: '#F3F4F6', color: '#374151' }
  const amount = orderAmount(order)
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <>
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isExpanded}
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 110px 140px 100px 36px',
          gap: 12,
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: !isLast || isExpanded ? '1px solid #F3F4F6' : 'none',
          cursor: 'pointer',
          background: isExpanded ? '#FAFAFA' : '#fff',
          transition: 'background 0.1s',
        }}
      >
        {/* Order ID */}
        <div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>
            #{order.id.slice(0, 16)}…
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>
            {order.items.length} article{order.items.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Client */}
        <div>
          <div style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>{order.customerName ?? '—'}</div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>{order.customerEmail ?? ''}</div>
        </div>

        {/* Amount */}
        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
          {(amount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </div>

        {/* Status badge */}
        <div>
          <span
            style={{
              display: 'inline-block',
              background: cfg.bg,
              color: cfg.color,
              padding: '4px 10px',
              borderRadius: 100,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{date}</div>

        {/* Chevron */}
        <div style={{ color: '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div
          style={{
            padding: '20px 24px',
            background: '#FAFAFA',
            borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Items */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                Articles de cette commande
              </p>
              {order.items.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#374151' }}>
                    {item.productName}
                    {item.size && <span style={{ color: '#9CA3AF' }}> — {item.size}</span>}
                    <span style={{ color: '#9CA3AF' }}>{' x'}{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {(item.priceEur * item.quantity / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                <span>Total commande</span>
                <span>{(orderAmount(order) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                  Adresse de livraison
                </p>
                <pre
                  style={{
                    fontSize: '0.85rem',
                    color: '#374151',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    fontFamily: 'system-ui, sans-serif',
                    lineHeight: 1.7,
                  }}
                >
                  {order.shippingAddress}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function EmptyState({ filter }: { filter: string }) {
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
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M13 16h14M13 22h10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ color: '#374151', fontWeight: 500, marginBottom: 6 }}>
        {filter === 'all' ? 'Aucune commande pour l\'instant.' : `Aucune commande avec le statut « ${FILTERS.find(f => f.key === filter)?.label} ».`}
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>
        Les commandes contenant vos produits apparaîtront ici.
      </p>
    </div>
  )
}
