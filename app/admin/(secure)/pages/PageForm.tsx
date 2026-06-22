'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Page } from '@/lib/db/schema'

interface Props {
  page?: Page
}

export default function PageForm({ page }: Props) {
  const router = useRouter()
  const isEdit = !!page

  const [form, setForm] = useState({
    id:             page?.id             ?? '',
    title:          page?.title          ?? '',
    content:        page?.content        ?? '',
    seoTitle:       page?.seoTitle       ?? '',
    seoDescription: page?.seoDescription ?? '',
    published:      page?.published      ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      seoTitle:       form.seoTitle       || null,
      seoDescription: form.seoDescription || null,
    }

    const res = await fetch(
      isEdit ? `/api/admin/pages/${page!.id}` : '/api/admin/pages',
      {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }
    )

    if (res.ok) {
      router.push('/admin/pages')
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Erreur')
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm('Supprimer définitivement cette page ?')) return
    await fetch(`/api/admin/pages/${page!.id}`, { method: 'DELETE' })
    router.push('/admin/pages')
    router.refresh()
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 600, color: '#555',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  }
  const inputStyle: React.CSSProperties = {
    padding: '10px 12px', border: '1px solid #e4e4e7',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none',
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={labelStyle}>Slug (ID) — identifiant URL</span>
        <input
          type="text"
          value={form.id}
          onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
          disabled={isEdit}
          placeholder="livraison, authenticite, retours…"
          required
          style={{ ...inputStyle, background: isEdit ? '#f9fafb' : '#fff' }}
        />
        {!isEdit && <span style={{ fontSize: '0.75rem', color: '#888' }}>La page sera accessible sur /p/{'{slug}'}</span>}
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={labelStyle}>Titre</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Politique de livraison"
          required
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={labelStyle}>Contenu (texte libre / HTML)</span>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          rows={14}
          placeholder="Contenu de la page…"
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '0.9rem' }}>Page publiée (visible sur le site)</span>
      </label>

      <div style={{ borderTop: '1px solid #e4e4e7', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SEO (optionnel)</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={labelStyle}>Titre SEO</span>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
            placeholder="Laisser vide pour utiliser le titre de la page"
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={labelStyle}>Description SEO</span>
          <textarea
            value={form.seoDescription}
            onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
            placeholder="Description pour les moteurs de recherche"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </label>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{ flex: 1, padding: '12px', background: '#0a0a0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
        >
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer la page'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={del}
            style={{ padding: '12px 20px', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  )
}
