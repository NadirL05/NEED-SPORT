import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/supplier-auth'
import { getSupplierProducts } from '@/lib/db/queries'

export async function GET(_req: NextRequest) {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value
    const supplierId = token ? await verifySessionToken(token) : null
    if (!supplierId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

    const prods = await getSupplierProducts(supplierId)
    return NextResponse.json(prods)
  } catch (err) {
    console.error('[supplier/products]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
