import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/api'
import { storeProductImage } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const form = await req.formData()
  const result = await storeProductImage(form.get('file') as File | null)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ url: result.url })
}
