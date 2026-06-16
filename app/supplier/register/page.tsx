'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupplierRegister() {
  const [form, setForm] = useState({ email: '', password: '', companyName: '', contactName: '', phone: '', country: 'FR' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/supplier/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    window.location.href = '/supplier'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.1em', color: '#fff' }}>NEED SPORT</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.2em', marginTop: 4 }}>DEVENIR FOURNISSEUR</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: 16, padding: '36px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Créer un compte fournisseur</h1>
          <p style={{ color: '#64748b', fontSize: '0.83rem', marginBottom: 28 }}>Accédez à vos commandes et gérez votre catalogue.</p>

          {error && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Société *</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)} required style={inputStyle} placeholder="PSG Store" />
            </div>
            <div>
              <label style={labelStyle}>Pays *</label>
              <select value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle}>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="ES">Espagne</option>
                <option value="IT">Italie</option>
                <option value="DE">Allemagne</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Nom du contact *</label>
          <input value={form.contactName} onChange={e => set('contactName', e.target.value)} required style={inputStyle} placeholder="Jean Dupont" />

          <label style={labelStyle}>Téléphone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="+33 6 00 00 00 00" />

          <label style={labelStyle}>Email professionnel *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required style={inputStyle} placeholder="contact@societe.com" />

          <label style={labelStyle}>Mot de passe *</label>
          <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required style={inputStyle} placeholder="8 caractères minimum" minLength={8} />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Création du compte…' : 'Créer mon compte fournisseur'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: '#64748b' }}>
            Déjà un compte ?{' '}
            <Link href="/supplier/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600,
  color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8, marginBottom: 16,
  background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
}
const btnStyle: React.CSSProperties = {
  width: '100%', padding: '13px', borderRadius: 8, background: '#3b82f6',
  color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none',
  cursor: 'pointer', marginTop: 8,
}
