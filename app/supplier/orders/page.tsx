'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

const TIMELINE_STEPS = [
  { key: 'pending',   label: 'Créée' },
  { key: 'paid',      label: 'Payée' },
  { key: 'shipped',   label: 'Expédiée' },
  { key: 'delivered', label: 'Livrée' },
]

function orderAmount(order: OrderWithItems) {
  return order.items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
}

export default function SupplierOrders() {
  const [orders, setOrders]     = useState<OrderWithItems[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/supplier/orders')
      .then(r => r.json() as Promise<OrderWithItems[]>)
      .then(d => { setOrders(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleStatusUpdate(orderId: string, newStatus: string) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

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
              onClick={() => { setFilter(f.key); setExpanded(null) }}
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
          {/* Header */}
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
              index={idx}
              isExpanded={expanded === o.id}
              isLast={idx === visible.length - 1}
              onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
              onStatusUpdate={handleStatusUpdate}
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

const NEXT_STATUS: Record<string, { label: string; confirmLabel: string }> = {
  paid:    { label: 'Marquer comme expédiée',  confirmLabel: 'Confirmer l\'expédition ?' },
  shipped: { label: 'Marquer comme livrée',    confirmLabel: 'Confirmer la livraison ?' },
}

const NEXT_STATUS_KEY: Record<string, string> = {
  paid:    'shipped',
  shipped: 'delivered',
}

function OrderRow({
  order,
  index,
  isExpanded,
  isLast,
  onToggle,
  onStatusUpdate,
}: {
  order: OrderWithItems
  index: number
  isExpanded: boolean
  isLast: boolean
  onToggle: () => void
  onStatusUpdate: (id: string, status: string) => void
}) {
  const [hovered, setHovered]       = useState(false)
  const [updating, setUpdating]     = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const nextAction = NEXT_STATUS[order.status]

  async function handleAdvanceStatus() {
    const newStatus = NEXT_STATUS_KEY[order.status]
    if (!newStatus) return
    setUpdating(true)
    setUpdateError(null)
    try {
      const res = await fetch(`/api/supplier/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erreur inconnue')
      }
      onStatusUpdate(order.id, newStatus)
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setUpdating(false)
    }
  }
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: '#F3F4F6', color: '#374151' }
  const amount = orderAmount(order)
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <>
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={isExpanded}
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 110px 140px 100px 36px',
          gap: 12,
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: !isLast || isExpanded ? '1px solid #F3F4F6' : 'none',
          cursor: 'pointer',
          background: isExpanded ? '#FAFAFA' : hovered ? '#F9FAFB' : '#fff',
          transition: 'background 0.12s',
          animation: `rowIn 0.3s ease both ${index * 40}ms`,
        }}
      >
        {/* Order ID */}
        <div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>
            #{order.id.slice(0, 16)}&hellip;
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

        {/* Status */}
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
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Animated expanded detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '24px',
                background: '#FAFAFA',
                borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
              }}
            >
              {/* Status timeline */}
              <div style={{ marginBottom: 24 }}>
                <OrderTimeline status={order.status} />
              </div>

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
                        <span style={{ color: '#9CA3AF' }}>{' ×'}{item.quantity}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: '#111827', flexShrink: 0 }}>
                        {(item.priceEur * item.quantity / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                    <span>Total commande</span>
                    <span>{(orderAmount(order) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </div>

                  {/* Fulfillment action */}
                  {nextAction && (
                    <div style={{ marginTop: 20 }}>
                      <button
                        onClick={handleAdvanceStatus}
                        disabled={updating}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 18px',
                          background: updating ? '#E5E7EB' : '#059669',
                          color: updating ? '#9CA3AF' : '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: updating ? 'not-allowed' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        {updating ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }}>
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="22" strokeDashoffset="8" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {updating ? 'Mise à jour…' : nextAction.label}
                      </button>
                      {updateError && (
                        <p style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6 }}>{updateError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping address */}
                {order.shippingAddress ? (
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
                ) : (
                  <div />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div
        style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.82rem',
          color: '#991B1B',
          fontWeight: 500,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Cette commande a été annulée.
      </div>
    )
  }

  const activeIdx = TIMELINE_STEPS.findIndex(s => s.key === status)

  return (
    <div>
      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
        Progression de la commande
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {TIMELINE_STEPS.flatMap((step, i) => {
          const isDone = i <= activeIdx
          const isActive = i === activeIdx

          const dot = (
            <div
              key={`step-${step.key}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isDone ? '#059669' : '#F3F4F6',
                  border: `2px solid ${isDone ? '#059669' : '#E5E7EB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2.25 2.25L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: isDone ? '#059669' : '#9CA3AF',
                  marginTop: 6,
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
          )

          if (i < TIMELINE_STEPS.length - 1) {
            const line = (
              <div
                key={`line-${i}`}
                style={{
                  flex: 1,
                  height: 2,
                  background: i < activeIdx ? '#059669' : '#E5E7EB',
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  transition: 'background 0.2s',
                }}
              />
            )
            return [dot, line]
          }
          return [dot]
        })}
      </div>
    </div>
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
        {filter === 'all'
          ? 'Aucune commande pour l\'instant.'
          : `Aucune commande avec le statut « ${FILTERS.find(f => f.key === filter)?.label} ».`}
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>
        Les commandes contenant vos produits apparaîtront ici.
      </p>
    </div>
  )
}
