import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const blob = await put(`products/${Date.now()}.${ext}`, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
