import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateSupplierStatus } from '@/lib/db/queries'

async function isAdmin() {
  const jar = await cookies()
  return jar.has('admin_session')
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    const { id } = await params
    const { status } = await req.json()
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })
    }
    await updateSupplierStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/suppliers/[id]]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
