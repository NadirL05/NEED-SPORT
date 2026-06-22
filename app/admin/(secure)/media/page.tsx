'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type MediaSlot = {
  key: string
  label: string
  description: string
  fallback: string
  section: string
}

type ApiPayload = {
  slots: MediaSlot[]
  images: Record<string, string>
}

function fileError(status: number, fallback = 'Une erreur est survenue.'): string {
  if (status === 401) return 'Session admin expirée. Reconnectez-vous.'
  if (status === 413) return 'Fichier trop volumineux.'
  return fallback
}

export default function AdminMediaPage() {
  const [slots, setSlots] = useState<MediaSlot[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/media')
      .then(async (r) => {
        if (!r.ok) throw new Error(fileError(r.status, 'Impossible de charger les médias.'))
        return r.json() as Promise<ApiPayload>
      })
      .then((d) => {
        setSlots(d.slots ?? [])
        setImages(d.images ?? {})
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Impossible de charger les médias.'))
      .finally(() => setLoading(false))
  }, [])

  async function upload(key: string, file: File) {
    setSaving(key)
    setError(null)
    try {
      const form = new FormData()
      form.append('key', key)
      form.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({})) as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? fileError(res.status, 'Upload impossible.'))
      if (data.url) setImages((prev) => ({ ...prev, [key]: data.url! }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload impossible.')
    } finally {
      setSaving(null)
    }
  }

  async function reset(key: string) {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? fileError(res.status, 'Suppression impossible.'))
      setImages((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible.')
    } finally {
      setSaving(null)
    }
  }

  const grouped = slots.reduce<Record<string, MediaSlot[]>>((acc, slot) => {
    ;(acc[slot.section] ??= []).push(slot)
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Médias du site</h1>
        <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 760 }}>
          Remplacez les images de vitrine sans toucher au code. Les produits se modifient dans “Produits”,
          les images des pays dans “Nations”. Ici : hero, blocs éditoriaux et visuels de page.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px', marginBottom: 20, fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#777' }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {Object.entries(grouped).map(([section, sectionSlots]) => (
            <section key={section}>
              <h2 style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>{section}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {sectionSlots.map((slot) => {
                  const customUrl = images[slot.key]
                  const src = customUrl ?? slot.fallback
                  const isSaving = saving === slot.key

                  return (
                    <article key={slot.key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <button
                        type="button"
                        onClick={() => inputRefs.current[slot.key]?.click()}
                        disabled={isSaving}
                        style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 10', border: 0, padding: 0, cursor: isSaving ? 'wait' : 'pointer', background: '#f4f4f5', overflow: 'hidden' }}
                        title="Remplacer l'image"
                      >
                        <Image src={src} alt={slot.label} fill sizes="320px" style={{ objectFit: 'cover' }} unoptimized={src.startsWith('http')} />
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSaving ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {isSaving ? 'En cours…' : ''}
                        </span>
                      </button>

                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>{slot.label}</h3>
                            <p style={{ margin: '6px 0 0', color: '#777', fontSize: '0.82rem', lineHeight: 1.45 }}>{slot.description}</p>
                          </div>
                          <span style={{ flexShrink: 0, background: customUrl ? '#dcfce7' : '#f4f4f5', color: customUrl ? '#166534' : '#71717a', borderRadius: 999, padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
                            {customUrl ? 'Custom' : 'Défaut'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                          <button
                            type="button"
                            onClick={() => inputRefs.current[slot.key]?.click()}
                            disabled={isSaving}
                            style={{ flex: 1, border: 0, borderRadius: 10, background: '#0a0a0b', color: '#fff', padding: '10px 12px', cursor: isSaving ? 'wait' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                          >
                            Remplacer
                          </button>
                          {customUrl && (
                            <button
                              type="button"
                              onClick={() => reset(slot.key)}
                              disabled={isSaving}
                              style={{ border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#ef4444', padding: '10px 12px', cursor: isSaving ? 'wait' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                            >
                              Réinitialiser
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        ref={(el) => { inputRefs.current[slot.key] = el }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) upload(slot.key, file)
                          e.target.value = ''
                        }}
                      />
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
