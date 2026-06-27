import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminAuth } from '@/lib/api'
import { auditAdminAction } from '@/lib/admin-audit'
import { getNationImages } from '@/lib/nations'

// Force dynamic so the HTTP response is never cached by Next.js router.
// The underlying blob.list() call uses unstable_cache (1h TTL, tag: nation-images)
// and is invalidated immediately on upload/delete via revalidateTag.
export const dynamic = 'force-dynamic'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const VALID_NATION_CODES = new Set(['fr','de','es','pt','en','it','nl','be','br','ar','mx','sn','ma','ng','jp','kr'])
const BLOB_NATIONS_PREFIX = process.env.BLOB_STORE_URL ? `${process.env.BLOB_STORE_URL}/nations/` : 'nations/'

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const images = await getNationImages()
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
  if (!VALID_NATION_CODES.has(code)) {
    return NextResponse.json({ error: 'Code nation invalide' }, { status: 400 })
  }
  // Remove any previously uploaded variant for this nation code before uploading
  // the new file. This prevents stale blobs from piling up and ensures the new
  // URL is truly fresh (Vercel Blob serves with Cache-Control: immutable).
  const existing = await list({ prefix: `nations/${code}` })
  if (existing.blobs.length) await del(existing.blobs.map((b) => b.url))

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/avif' ? 'avif' : file.type === 'image/png' ? 'png' : 'jpg'
  // addRandomSuffix: true ensures a unique URL on every upload, bypassing the
  // CDN's immutable cache even when replacing an image at the same logical path.
  const blob = await put(`nations/${code}.${ext}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type })

  revalidateTag('nation-images', 'max')
  revalidatePath('/')
  auditAdminAction({ action: 'create', resource: 'nation', resourceId: code, summary: `Image uploadée: ${code}` })
  return NextResponse.json({ url: blob.url })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const body = await req.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code : null
  if (!code || !VALID_NATION_CODES.has(code)) {
    return NextResponse.json({ error: 'Code nation invalide' }, { status: 400 })
  }

  const existing = await list({ prefix: `nations/${code}` })
  if (existing.blobs.length) await del(existing.blobs.map((b) => b.url))

  revalidateTag('nation-images', 'max')
  revalidatePath('/')
  auditAdminAction({ action: 'delete', resource: 'nation', resourceId: code, summary: `Image supprimée: ${code}` })
  return NextResponse.json({ ok: true })
}
