'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@/lib/db/schema'

interface Props {
  product?: Product
}

const CATEGORIES = ['clubs', 'nations', 'limited', 'vintage']

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    id:       product?.id       ?? '',
    club:     product?.club     ?? '',
    name:     product?.name     ?? '',
    priceEur: product ? (product.priceEur / 100).toFixed(2) : '',
    img:      product?.img      ?? '',
    stock:    product?.stock    ?? 100,
    active:   product?.active   ?? true,
    cat:      product?.cat      ?? [] as string[],
  })
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json() as { url: string }
      if (url) setForm((f) => ({ ...f, img: url }))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const toggle = (cat: string) =>
    setForm((f) => ({
      ...f,
      cat: f.cat.includes(cat) ? f.cat.filter((c) => c !== cat) : [...f.cat, cat],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      priceEur: Math.round(parseFloat(form.priceEur as string) * 100),
    }

    const res = await fetch(
      isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (res.ok) {
      router.push('/admin/products')
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Erreur')
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm('Désactiver ce produit ?')) return
    await fetch(`/api/admin/products/${product!.id}`, { method: 'DELETE' })
    router.push('/admin/products')
    router.refresh()
  }

  const field = (label: string, key: keyof typeof form, type = 'text', extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
        {...extra}
      />
    </label>
  )

  return (
    <form onSubmit={submit} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {field('ID produit', 'id', 'text', { disabled: isEdit, placeholder: 'psg-home-2026' })}
      {field('Club / Nation', 'club', 'text', { required: true, placeholder: 'Paris Saint-Germain' })}
      {field('Nom', 'name', 'text', { required: true, placeholder: 'Home 2026' })}
      {field('Prix (€)', 'priceEur', 'text', { required: true, placeholder: '149.90' })}
      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Image</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {form.img && (
            <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e4e4e7' }}>
              <Image src={form.img} alt="preview" fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="url"
              value={form.img}
              onChange={(e) => setForm((f) => ({ ...f, img: e.target.value }))}
              placeholder="https://... ou utilise le bouton ci-dessous"
              style={{ padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ padding: '9px 16px', background: uploading ? '#f4f4f5' : '#f9fafb', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer', color: '#333' }}
            >
              {uploading ? 'Upload en cours…' : '📁 Choisir depuis mon Mac'}
            </button>
          </div>
        </div>
      </label>
      {field('Stock', 'stock', 'number', { min: 0 })}

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Catégories</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              style={{
                padding: '6px 16px', borderRadius: '100px', border: '1px solid',
                borderColor: form.cat.includes(cat) ? '#0a0a0b' : '#e4e4e7',
                background: form.cat.includes(cat) ? '#0a0a0b' : '#fff',
                color: form.cat.includes(cat) ? '#fff' : '#555',
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '0.9rem' }}>Produit actif (visible sur le site)</span>
      </label>

      {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{ flex: 1, padding: '12px', background: '#0a0a0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
        >
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={del}
            style={{ padding: '12px 20px', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Désactiver
          </button>
        )}
      </div>
    </form>
  )
}
