import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from '@/lib/api'
import { MEDIA_SLOTS, MEDIA_SLOT_KEYS, getMediaSlotImages, mediaSlotPath, mediaSlotPathPrefix } from '@/lib/media-slots'

// Force dynamic so the GET handler always calls list() fresh (never static cache)
export const dynamic = 'force-dynamic'

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const images = await getMediaSlotImages()
  return NextResponse.json({ slots: MEDIA_SLOTS, images })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const form = await req.formData()
  const key = form.get('key')
  const file = form.get('file')

  if (typeof key !== 'string' || !MEDIA_SLOT_KEYS.has(key)) {
    return NextResponse.json({ error: 'Emplacement média invalide.' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })
  }

  const ext = ALLOWED_MIME[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo).' }, { status: 400 })
  }

  // One active file per slot: remove previous ext variants before uploading the
  // new image. del() is best-effort/free; failures should not leave admin stuck.
  const existing = await list({ prefix: mediaSlotPathPrefix(key) })
  if (existing.blobs.length) {
    await del(existing.blobs.map((b) => b.url))
  }

  const blob = await put(mediaSlotPath(key, ext), file, {
    access:          'public',
    addRandomSuffix: false,
    contentType:     file.type,
  })

  revalidatePath('/')
  return NextResponse.json({ url: blob.url })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const body = await req.json().catch(() => null) as { key?: unknown } | null
  const key = body?.key
  if (typeof key !== 'string' || !MEDIA_SLOT_KEYS.has(key)) {
    return NextResponse.json({ error: 'Emplacement média invalide.' }, { status: 400 })
  }

  const existing = await list({ prefix: mediaSlotPathPrefix(key) })
  if (existing.blobs.length) await del(existing.blobs.map((b) => b.url))

  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
