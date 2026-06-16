import { NextRequest, NextResponse } from 'next/server'
import { getSupplierStats } from '@/lib/db/queries'
import { requireSupplierAuth, ok, err } from '@/lib/api'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireSupplierAuth()
    if (auth instanceof NextResponse) return auth
    const stats = await getSupplierStats(auth.supplierId)
    return ok(stats)
  } catch (e) {
    console.error('[supplier/stats]', e)
    return err('Erreur serveur.', 500)
  }
}
