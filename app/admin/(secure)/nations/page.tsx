'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const NATIONS = [
  { code: 'fr', name: 'France',     color: '#002395' },
  { code: 'de', name: 'Allemagne',  color: '#2a2a2a' },
  { code: 'es', name: 'Espagne',    color: '#c60b1e' },
  { code: 'pt', name: 'Portugal',   color: '#1e6f30' },
  { code: 'en', name: 'Angleterre', color: '#2c2c2c' },
  { code: 'it', name: 'Italie',     color: '#003399' },
  { code: 'nl', name: 'Pays-Bas',   color: '#ae1c28' },
  { code: 'be', name: 'Belgique',   color: '#1a1a1a' },
  { code: 'br', name: 'Brésil',     color: '#009c3b' },
  { code: 'ar', name: 'Argentine',  color: '#74acdf' },
  { code: 'mx', name: 'Mexique',    color: '#006847' },
  { code: 'sn', name: 'Sénégal',    color: '#00853F' },
  { code: 'ma', name: 'Maroc',      color: '#C1272D' },
  { code: 'ng', name: 'Nigeria',    color: '#008751' },
  { code: 'jp', name: 'Japon',      color: '#BC002D' },
  { code: 'kr', name: 'Corée',      color: '#003478' },
]

export default function AdminNationsPage() {
  const router = useRouter()
  const [images, setImages] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/nations')
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? {}))
  }, [])

  async function handleUpload(code: string, file: File) {
    setUploading(code)
    const form = new FormData()
    form.append('code', code)
    form.append('file', file)
    const res = await fetch('/api/admin/nations', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) setImages((prev) => ({ ...prev, [code]: data.url }))
    setUploading(null)
  }

  async function handleDelete(code: string) {
    const url = images[code]
    if (!url) return
    setDeleting(code)
    await fetch('/api/admin/nations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    setImages((prev) => { const n = { ...prev }; delete n[code]; return n })
    setDeleting(null)
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>Images Nations</h1>
        <p style={{ color: '#888', fontSize: '0.88rem' }}>
          Cliquez sur une carte pour uploader une image. Formats acceptés : JPG, PNG, WebP, AVIF (max 10 Mo).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {NATIONS.map((n) => {
          const imgUrl = images[n.code]
          const isUploading = uploading === n.code
          const isDeleting = deleting === n.code

          return (
            <div key={n.code} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'relative' }}>
              {/* Image zone */}
              <div
                onClick={() => inputRefs.current[n.code]?.click()}
                style={{
                  height: '180px',
                  position: 'relative',
                  cursor: 'pointer',
                  background: imgUrl ? 'transparent' : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: imgUrl ? 'none' : '2px dashed #ddd',
                  borderRadius: imgUrl ? '0' : '12px 12px 0 0',
                  overflow: 'hidden',
                  transition: 'opacity 0.2s',
                }}
              >
                {imgUrl ? (
                  <Image src={imgUrl} alt={n.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#bbb' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <div style={{ fontSize: '0.7rem', marginTop: '8px', letterSpacing: '0.05em' }}>Cliquer pour uploader</div>
                  </div>
                )}

                {/* Loading overlay */}
                {(isUploading || isDeleting) && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>
                    {isUploading ? 'Upload...' : 'Suppression...'}
                  </div>
                )}

                {/* Hover overlay on existing image */}
                {imgUrl && !isUploading && !isDeleting && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <span style={{ color: '#fff', fontSize: '0.72rem', opacity: 0, transition: 'opacity 0.2s', letterSpacing: '0.05em' }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                      Remplacer
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  style={{ display: 'none' }}
                  ref={(el) => { inputRefs.current[n.code] = el }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(n.code, f)
                    e.target.value = ''
                  }}
                />
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 14px', borderTop: `3px solid ${n.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{n.name}</span>
                  {imgUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.code) }}
                      disabled={isDeleting}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px 4px', fontSize: '0.75rem', opacity: isDeleting ? 0.5 : 1 }}
                      title="Supprimer l'image"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/admin/products?nation=${encodeURIComponent(n.name)}`)}
                  style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  + Ajouter maillot
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
