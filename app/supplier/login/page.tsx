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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left brand panel */}
      <div
        style={{
          width: '44%',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.13em', color: '#fff' }}>
          NeedFoot
        </div>

        <div>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>
            Manage your catalog from a dedicated space.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
            Access your orders, adjust your stock, and track your performance in real time.
          </p>
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
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Log in
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 32 }}>
            Access your NeedFoot supplier portal.
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
            <label style={labelSt}>Business email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputSt}
              placeholder="contact@brand.com"
              autoComplete="email"
            />

            <label style={labelSt}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputSt}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <button type="submit" disabled={loading} style={btnSt}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: '#6B7280' }}>
            Not a supplier yet?{' '}
            <Link href="/supplier/register" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              Apply now
            </Link>
          </p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #F3F4F6' }}>
            <Link href="/" style={{ color: '#9CA3AF', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8 6H4M4 6l2.5-2.5M4 6l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to store
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
