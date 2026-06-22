import { NextRequest, NextResponse } from 'next/server'
import { getSupplierProducts } from '@/lib/db/queries'
import { requireSupplierAuth, ok, err } from '@/lib/api'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireSupplierAuth()
    if (auth instanceof NextResponse) return auth
    const products = await getSupplierProducts(auth.supplierId)
    return ok(products)
  } catch (e) {
    console.error('[supplier/products]', e)
    return err('Erreur serveur.', 500)
  }
}
