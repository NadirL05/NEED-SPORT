'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupplierRegister() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    contactName: '',
    phone: '',
    country: 'FR',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left brand panel */}
      <div
        style={{
          width: '40%',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 48px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.13em', color: '#fff' }}>
          NeedFoot
        </div>

        <div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 16 }}>
            Rejoignez le réseau officiel de fournisseurs.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Accès à votre tableau de bord en temps réel',
              'Gestion simplifiée des stocks',
              'Visibilité sur toutes vos commandes',
            ].map(item => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 12,
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#334155" strokeWidth="1.5" />
                  <path d="M5.5 8l1.75 1.75L10.5 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#334155' }}>
          © 2024 NeedFoot — Certifié officiel
        </p>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Créer un compte fournisseur
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 32 }}>
            Accédez à vos commandes et gérez votre catalogue dès maintenant.
          </p>

          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.85rem',
                marginBottom: 20,
                border: '1px solid #FECACA',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>
              <div>
                <label style={labelSt}>Société *</label>
                <input
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  required
                  style={inputSt}
                  placeholder="PSG Store"
                />
              </div>
              <div>
                <label style={labelSt}>Pays *</label>
                <select
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  style={inputSt}
                >
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="ES">Espagne</option>
                  <option value="IT">Italie</option>
                  <option value="DE">Allemagne</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelSt}>Nom du contact *</label>
                <input
                  value={form.contactName}
                  onChange={e => set('contactName', e.target.value)}
                  required
                  style={inputSt}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label style={labelSt}>Téléphone</label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  style={inputSt}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
            </div>

            <label style={labelSt}>Email professionnel *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              style={inputSt}
              placeholder="contact@societe.com"
              autoComplete="email"
            />

            <label style={labelSt}>Mot de passe *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              style={inputSt}
              placeholder="8 caractères minimum"
              minLength={8}
              autoComplete="new-password"
            />

            <button type="submit" disabled={loading} style={btnSt}>
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: '#6B7280' }}>
            Déjà un compte ?{' '}
            <Link href="/supplier/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              Se connecter
            </Link>
          </p>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #F3F4F6' }}>
            <Link href="/" style={{ color: '#9CA3AF', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8 6H4M4 6l2.5-2.5M4 6l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelSt: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
}

const inputSt: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  marginBottom: 16,
  background: '#fff',
  border: '1px solid #D1D5DB',
  color: '#111827',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const btnSt: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  borderRadius: 8,
  background: '#111827',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.9rem',
  border: 'none',
  cursor: 'pointer',
  marginTop: 4,
}
