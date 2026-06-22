import { NextRequest, NextResponse } from 'next/server'
import { getAllSuppliers } from '@/lib/db/queries'
import { requireAdminAuth, ok, err } from '@/lib/api'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAdminAuth()
    if (auth !== true) return auth

    const list = await getAllSuppliers()
    return ok(list.map(({ passwordHash: _omit, ...s }) => s))
  } catch (e) {
    console.error('[admin/suppliers]', e)
    return err('Erreur serveur.', 500)
  }
}
