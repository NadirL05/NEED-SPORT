import { NextRequest, NextResponse } from 'next/server'
import { getSupplierOrders } from '@/lib/db/queries'
import { requireSupplierAuth, ok, err } from '@/lib/api'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireSupplierAuth()
    if (auth instanceof NextResponse) return auth
    const orders = await getSupplierOrders(auth.supplierId)
    return ok(orders)
  } catch (e) {
    console.error('[supplier/orders]', e)
    return err('Erreur serveur.', 500)
  }
}
