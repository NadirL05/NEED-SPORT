import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from '@/lib/api'
import { storeProductImage } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const form = await req.formData()
  const result = await storeProductImage(form.get('file') as File | null)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

  // Invalidate all pages that display product images so the new URL is visible
  // without a manual refresh. The product page itself uses force-dynamic and
  // fetches fresh data on every request, so no revalidation needed there.
  revalidatePath('/')
  revalidatePath('/shop')

  return NextResponse.json({ url: result.url })
}
