'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, token: token || undefined }),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({} as { error?: string; twoFactorRequired?: boolean }))
    if (data?.twoFactorRequired) {
      setTwoFactor(true)
      setError(token ? 'Code 2FA invalide' : 'Saisissez votre code à 6 chiffres')
    } else if (res.status === 429) {
      setError(data?.error || 'Trop de tentatives. Réessayez plus tard.')
    } else {
      setError('Mot de passe incorrect')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: '40px', borderRadius: '16px', width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontFamily: 'sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>NEEDSPORT. Admin</h1>
        <p style={{ color: '#888', fontSize: '.85rem', marginBottom: '28px', fontFamily: 'sans-serif' }}>Accès réservé à l&apos;équipe</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          autoComplete="current-password"
          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
        />
        {twoFactor && (
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Code 2FA (6 chiffres)"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '1rem', letterSpacing: '0.3em', textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
          />
        )}
        {error && <p style={{ color: '#ef4444', fontSize: '.82rem', marginBottom: '12px', fontFamily: 'sans-serif' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#0a0a0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Connexion…' : twoFactor ? 'Vérifier' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
