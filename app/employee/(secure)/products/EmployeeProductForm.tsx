'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product } from '@/lib/db/schema'
import {
  getProductImageValidationError,
  MAX_PRODUCT_IMAGES,
  parseImgs,
  serializeImgs,
} from '@/lib/product-images'

interface Props { product?: Product }

const CATEGORIES = ['clubs', 'nations', 'limited', 'vintage']

export default function EmployeeProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    id:                product?.id                                                          ?? '',
    club:              product?.club                                                        ?? '',
    name:              product?.name                                                        ?? '',
    priceEur:          product ? (product.priceEur / 100).toFixed(2) : '',
    compareAtPriceEur: product?.compareAtPriceEur ? (product.compareAtPriceEur / 100).toFixed(2) : '',
    stock:             product?.stock                                                       ?? 100,
    active:            product?.active                                                      ?? true,
    cat:               product?.cat                                                         ?? [] as string[],
    seoTitle:          product?.seoTitle                                                    ?? '',
    seoDescription:    product?.seoDescription                                              ?? '',
  })
  // images handled separately so we can add/remove independently
  const [imgs, setImgs] = useState<string[]>(parseImgs(product?.img))

  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/employee/upload', { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({})) as { url?: string; error?: string }
    if (!res.ok) throw new Error(data.error ?? `Échec de l’upload (${res.status}).`)
    if (!data.url) throw new Error('L’upload n’a retourné aucune URL de photo.')
    return data.url
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_PRODUCT_IMAGES - imgs.length
    if (files.length > remaining) {
      setError(`Tu peux ajouter ${remaining} photo${remaining > 1 ? 's' : ''} maximum.`)
      e.target.value = ''
      return
    }

    setUploading(true)
    setError('')
    const urls: string[] = []
    try {
      for (const file of files) {
        urls.push(await uploadFile(file))
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Échec de l’upload.')
    } finally {
      if (urls.length) setImgs((prev) => [...prev, ...urls].slice(0, MAX_PRODUCT_IMAGES))
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const replaceImg = async (idx: number, input: HTMLInputElement) => {
    const file = input.files?.[0]
    if (!file || uploading) return

    setUploading(true)
    setError('')
    try {
      const url = await uploadFile(file)
      setImgs((prev) => prev.map((current, imageIndex) => imageIndex === idx ? url : current))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Échec du remplacement.')
    } finally {
      setUploading(false)
      input.value = ''
    }
  }

  const removeImg = (idx: number) =>
    setImgs((prev) => prev.filter((_, i) => i !== idx))

  const moveFirst = (idx: number) =>
    setImgs((prev) => [prev[idx], ...prev.filter((_, i) => i !== idx)])

  const moveImg = (idx: number, offset: -1 | 1) =>
    setImgs((prev) => {
      const target = idx + offset
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })

  const toggle = (cat: string) =>
    setForm((f) => ({
      ...f,
      cat: f.cat.includes(cat) ? f.cat.filter((c) => c !== cat) : [...f.cat, cat],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const serializedImgs = serializeImgs(imgs)
    const imageError = getProductImageValidationError(serializedImgs)
    if (imageError) { setError(imageError); return }
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      img: serializedImgs,
      priceEur:          Math.round(parseFloat(form.priceEur as string) * 100),
      compareAtPriceEur: form.compareAtPriceEur
        ? Math.round(parseFloat(form.compareAtPriceEur as string) * 100)
        : null,
      seoTitle:          form.seoTitle       || null,
      seoDescription:    form.seoDescription || null,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/employee/products/${product!.id}` : '/api/employee/products',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `Échec de l’enregistrement (${res.status}).`)
      }
      router.push('/employee/products')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Échec de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async () => {
    if (!confirm('Désactiver ce produit ?')) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/employee/products/${product!.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? `Échec de la désactivation (${res.status}).`)
      router.push('/employee/products')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Échec de la désactivation.')
    } finally {
      setSaving(false)
    }
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
      {field('Prix barré — soldes (€)', 'compareAtPriceEur', 'text', { placeholder: 'Laisser vide si pas de solde' })}

      {/* ── Multi-image upload ─────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Photos ({imgs.length}/{MAX_PRODUCT_IMAGES}) <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#888' }}>— clique sur une image pour la mettre en 1re position</span>
        </span>

        {/* Thumbnails grid */}
        {imgs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {imgs.map((url, idx) => (
              <div key={url + idx} style={{ position: 'relative', width: 90, height: 90, borderRadius: '10px', overflow: 'hidden', border: idx === 0 ? '2px solid #0f172a' : '1px solid #e4e4e7', flexShrink: 0 }}>
                <button type="button" onClick={() => moveFirst(idx)} style={{ position: 'absolute', inset: 0, background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }} title="Mettre en 1re position" aria-label="Photo principale">
                  <Image src={url} alt={`Photo ${idx + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                </button>
                {idx === 0 && (
                  <span style={{ position: 'absolute', top: 4, left: 4, background: '#0f172a', color: '#fff', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImg(idx)}
                  style={{ position: 'absolute', zIndex: 2, top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 0, color: '#fff', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                  aria-label="Supprimer cette photo"
                >
                  ×
                </button>
                <label title="Remplacer cette photo" style={{ position: 'absolute', zIndex: 2, top: 4, right: 28, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.7rem', cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ↻
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading}
                    style={{ display: 'none' }}
                    onChange={(event) => void replaceImg(idx, event.currentTarget)}
                  />
                </label>
                <div style={{ position: 'absolute', zIndex: 2, bottom: 4, left: 4, display: 'flex', gap: 3 }}>
                  <button type="button" disabled={idx === 0} onClick={() => moveImg(idx, -1)} aria-label="Déplacer la photo vers la gauche" style={{ width: 20, height: 20, padding: 0, border: 0, borderRadius: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: idx === 0 ? 'default' : 'pointer' }}>‹</button>
                  <button type="button" disabled={idx === imgs.length - 1} onClick={() => moveImg(idx, 1)} aria-label="Déplacer la photo vers la droite" style={{ width: 20, height: 20, padding: 0, border: 0, borderRadius: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: idx === imgs.length - 1 ? 'default' : 'pointer' }}>›</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || imgs.length >= MAX_PRODUCT_IMAGES}
          style={{ alignSelf: 'flex-start', padding: '10px 18px', background: uploading ? '#f4f4f5' : '#f9fafb', border: '1px solid #e4e4e7', borderRadius: '10px', fontSize: '0.88rem', cursor: uploading ? 'wait' : 'pointer', color: '#333', fontWeight: 500 }}
        >
          {uploading ? '⏳ Upload en cours…' : imgs.length >= MAX_PRODUCT_IMAGES ? '4 photos maximum' : '📷 Ajouter des photos'}
        </button>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>JPG, PNG, WebP ou AVIF · max 10 Mo · sélection multiple possible</p>
      </div>

      {field('Stock', 'stock', 'number', { min: 0 })}

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Catégories</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat} type="button" onClick={() => toggle(cat)}
              style={{
                padding: '6px 16px', borderRadius: '100px', border: '1px solid',
                borderColor: form.cat.includes(cat) ? '#0f172a' : '#e4e4e7',
                background: form.cat.includes(cat) ? '#0f172a' : '#fff',
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
        <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
        <span style={{ fontSize: '0.9rem' }}>Produit actif (visible sur le site)</span>
      </label>

      <div style={{ borderTop: '1px solid #e4e4e7', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SEO (optionnel)</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Titre SEO</span>
          <input type="text" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} placeholder="Laisser vide pour titre automatique" style={{ padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description SEO</span>
          <textarea value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} placeholder="Laisser vide pour description automatique" rows={3} style={{ padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
        </label>
      </div>

      {error && <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button
          type="submit" disabled={saving}
          style={{ flex: 1, padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
        >
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        {isEdit && (
          <button type="button" onClick={deactivate}
            style={{ padding: '12px 20px', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Désactiver
          </button>
        )}
      </div>
    </form>
  )
}
