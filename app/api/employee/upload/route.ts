import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { put } from '@vercel/blob'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token || !(await verifyEmployeeToken(token))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const blob = await put(`products/${Date.now()}.${ext}`, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
