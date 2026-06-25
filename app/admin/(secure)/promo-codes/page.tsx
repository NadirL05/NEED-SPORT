'use client'

import { useEffect, useState } from 'react'

interface PromoCode {
  id: string
  code: string
  discountPct: number
  description: string
  active: boolean
  showOnSite: boolean
  expiresAt: string | null
  createdAt: string
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    code: '', discountPct: 10, description: '', showOnSite: false, expiresAt: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [])

  async function load(signal?: AbortSignal) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/promo-codes', { signal })
      const data = await res.json()
      setCodes(Array.isArray(data) ? data : [])
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError('Erreur de chargement des codes promo')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discountPct: Number(form.discountPct),
        expiresAt: form.expiresAt || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Erreur lors de la création')
    } else {
      setSuccess(`Code "${data.code}" créé avec succès !`)
      setForm({ code: '', discountPct: 10, description: '', showOnSite: false, expiresAt: '' })
      await load()
    }
    setCreating(false)
  }

  async function toggle(id: string, field: 'active' | 'showOnSite', val: boolean) {
    setCodes(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c))
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: val }),
      })
      if (!res.ok) throw new Error('Échec de la mise à jour')
    } catch {
      setCodes(prev => prev.map(c => c.id === id ? { ...c, [field]: !val } : c))
      setError('Erreur lors de la mise à jour')
    }
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Supprimer le code "${code}" ?`)) return
    const backup = codes.find(c => c.id === id)
    setCodes(prev => prev.filter(c => c.id !== id))
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Échec de la suppression')
    } catch {
      if (backup) setCodes(prev => [...prev, backup])
      setError('Erreur lors de la suppression')
    }
  }

  const inp: React.CSSProperties = { border: '1.5px solid #e0e0e0', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', marginBottom: '4px', display: 'block' }
  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Codes promo</h1>
      <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '32px' }}>
        Créez et gérez vos codes de réduction. Les codes actifs sont appliqués au checkout Stripe.
      </p>

      {/* Create form */}
      <form onSubmit={handleCreate} style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Nouveau code</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={fieldStyle}>
            <label style={lbl}>Code *</label>
            <input style={inp} placeholder="SUMMER20" value={form.code} required onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          </div>
          <div style={fieldStyle}>
            <label style={lbl}>Réduction (%) *</label>
            <input style={inp} type="number" min={1} max={100} value={form.discountPct} required onChange={e => setForm(f => ({ ...f, discountPct: Number(e.target.value) }))} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
            <label style={lbl}>Description</label>
            <input style={inp} placeholder="Soldes été 2026" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={fieldStyle}>
            <label style={lbl}>Expiration (optionnel)</label>
            <input style={inp} type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
            <input type="checkbox" id="showOnSite" checked={form.showOnSite} onChange={e => setForm(f => ({ ...f, showOnSite: e.target.checked }))} />
            <label htmlFor="showOnSite" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Afficher sur le site</label>
          </div>
        </div>
        {error   && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>}
        {success && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '12px' }}>{success}</p>}
        <button type="submit" disabled={creating} style={{ marginTop: '16px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '0.88rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}>
          {creating ? 'Création…' : '+ Créer le code'}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p style={{ color: '#888' }}>Chargement…</p>
      ) : codes.length === 0 ? (
        <p style={{ color: '#888' }}>Aucun code promo créé pour l&apos;instant.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                {['Code', 'Réduction', 'Description', 'Expiration', 'Actif', 'Affiché', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#666' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{c.code}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>−{c.discountPct}%</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{c.description || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#888' }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '∞'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggle(c.id, 'active', !c.active)} style={{ background: c.active ? '#dcfce7' : '#f3f4f6', color: c.active ? '#16a34a' : '#888', border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                      {c.active ? 'Oui' : 'Non'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggle(c.id, 'showOnSite', !c.showOnSite)} style={{ background: c.showOnSite ? '#dbeafe' : '#f3f4f6', color: c.showOnSite ? '#2563eb' : '#888', border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                      {c.showOnSite ? 'Affiché' : 'Caché'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => remove(c.id, c.code)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
