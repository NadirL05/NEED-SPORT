import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllSuppliers } from '@/lib/db/queries'

async function isAdmin() {
  const jar = await cookies()
  return jar.has('admin_session')
}

export async function GET(_req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const list = await getAllSuppliers()
  return NextResponse.json(list.map((s) => ({ ...s, passwordHash: undefined })))
}
