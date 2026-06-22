import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from '@/lib/api'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { blobs } = await list({ prefix: 'nations/' })
  const images: Record<string, string> = {}
  for (const b of blobs) {
    const code = b.pathname.replace('nations/', '').replace(/\.[^.]+$/, '')
    images[code] = b.url
  }
  return NextResponse.json({ images })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const form = await req.formData()
  const file = form.get('file') as File | null
  const code = form.get('code') as string | null

  if (!file || !code) return NextResponse.json({ error: 'Missing file or code' }, { status: 400 })
  if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo)' }, { status: 400 })

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/avif' ? 'avif' : file.type === 'image/png' ? 'png' : 'jpg'
  const blob = await put(`nations/${code}.${ext}`, file, { access: 'public', addRandomSuffix: false })

  // Make the new image appear on the statically-prerendered homepage right away.
  revalidatePath('/')

  return NextResponse.json({ url: blob.url })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  await del(url)
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
