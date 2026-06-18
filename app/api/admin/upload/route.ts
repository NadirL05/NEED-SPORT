import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminAuth } from '@/lib/api'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed. Use JPEG, PNG, WebP, or AVIF.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const blob = await put(`products/${Date.now()}.${ext}`, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
