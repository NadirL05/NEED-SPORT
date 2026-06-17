'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
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
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: '40px', borderRadius: '16px', width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontFamily: 'sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>NEEDFOOT. Admin</h1>
        <p style={{ color: '#888', fontSize: '.85rem', marginBottom: '28px', fontFamily: 'sans-serif' }}>Accès réservé à l&apos;équipe</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          required
          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '.82rem', marginBottom: '12px', fontFamily: 'sans-serif' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#0a0a0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
