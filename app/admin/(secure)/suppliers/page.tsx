'use client'

import { useEffect, useState } from 'react'
import type { Supplier } from '@/lib/db/schema'

type SupplierRow = Omit<Supplier, 'passwordHash'>

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Actif',     bg: '#D1FAE5', color: '#065F46' },
  pending:   { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  suspended: { label: 'Suspendu',  bg: '#FEE2E2', color: '#991B1B' },
}

const STATUSES = ['active', 'pending', 'suspended'] as const
type Status = typeof STATUSES[number]

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [updating, setUpdating]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/suppliers')
      .then(r => r.json() as Promise<SupplierRow[]>)
      .then(d => { setSuppliers(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: Status) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      }
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Fournisseurs</h1>
          {!loading && (
            <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.88rem' }}>
              {suppliers.length} compte{suppliers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Chargement…</p>
      ) : suppliers.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4e4e7', padding: '48px', textAlign: 'center', color: '#999' }}>
          Aucun fournisseur inscrit pour l&apos;instant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suppliers.map(s => {
            const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pending
            const isOpen = expanded === s.id
            return (
              <div
                key={s.id}
                style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}
              >
                {/* Summary row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
                    alignItems: 'center',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>{s.companyName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>{s.contactName}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>{s.email}</div>
                  <div>
                    <span
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        padding: '4px 12px',
                        borderRadius: 100,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#888' }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{isOpen ? '▲' : '▼'}</div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f0f0f0', padding: '20px', background: '#fafafa' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                      {/* Info */}
                      <div>
                        <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                          Informations
                        </h3>
                        <table style={{ fontSize: '0.85rem', borderCollapse: 'collapse', width: '100%' }}>
                          <tbody>
                            {[
                              ['Entreprise', s.companyName],
                              ['Contact',    s.contactName],
                              ['Email',      s.email],
                              ['Téléphone',  s.phone ?? '—'],
                              ['Pays',       s.country],
                              ['ID',         s.id],
                            ].map(([k, v]) => (
                              <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 0', color: '#888', width: 100 }}>{k}</td>
                                <td style={{ padding: '6px 0', color: '#333', fontFamily: k === 'ID' ? 'monospace' : undefined, fontSize: k === 'ID' ? '0.78rem' : undefined }}>{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Status management */}
                      <div>
                        <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                          Changer le statut
                        </h3>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {STATUSES.map(st => {
                            const c = STATUS_CONFIG[st]
                            const isActive = s.status === st
                            const isLoading = updating === s.id
                            return (
                              <button
                                key={st}
                                disabled={isActive || isLoading}
                                onClick={() => updateStatus(s.id, st)}
                                style={{
                                  padding: '7px 16px',
                                  borderRadius: 100,
                                  border: `1.5px solid ${isActive ? c.color : '#e4e4e7'}`,
                                  background: isActive ? c.bg : '#fff',
                                  color: isActive ? c.color : '#555',
                                  fontSize: '0.8rem',
                                  fontWeight: isActive ? 700 : 400,
                                  cursor: isActive || isLoading ? 'default' : 'pointer',
                                  opacity: isLoading && !isActive ? 0.5 : 1,
                                  transition: 'all 0.15s',
                                }}
                              >
                                {c.label}
                              </button>
                            )
                          })}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 12 }}>
                          «&nbsp;Suspendu&nbsp;» empêche le fournisseur de se connecter.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
