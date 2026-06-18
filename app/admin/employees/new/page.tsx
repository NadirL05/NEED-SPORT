'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const [form, setForm] = useState({ id: '', name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/admin/employees')
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Erreur')
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required
        placeholder={placeholder}
        style={{ padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
      />
    </label>
  )

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <Link href="/admin/employees" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>← Retour aux employés</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 0' }}>Nouvel employé</h1>
      </div>

      <form onSubmit={submit} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
        {field('ID (slug unique)', 'id', 'text', 'jean-dupont')}
        {field('Nom complet', 'name', 'text', 'Jean Dupont')}
        {field('Email', 'email', 'email', 'jean@needsport.com')}
        {field('Mot de passe', 'password', 'password', 'Minimum 8 caractères')}

        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px', background: '#0a0a0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
        >
          {saving ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </div>
  )
}
