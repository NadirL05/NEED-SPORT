'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupplierLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/supplier/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    window.location.href = '/supplier'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.1em', color: '#fff' }}>NEED SPORT</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.2em', marginTop: 4 }}>ESPACE FOURNISSEUR</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: 16, padding: '36px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 28 }}>Connexion</h1>

          {error && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle} placeholder="contact@marque.com" />

          <label style={labelStyle}>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required style={inputStyle} placeholder="••••••••" />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: '#64748b' }}>
            Pas encore fournisseur ?{' '}
            <Link href="/supplier/register" style={{ color: '#60a5fa', textDecoration: 'none' }}>Faire une demande</Link>
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
