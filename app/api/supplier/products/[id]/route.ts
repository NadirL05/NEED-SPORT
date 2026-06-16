import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/supplier-auth'
import { getSupplierProducts, updateSupplierProductStock } from '@/lib/db/queries'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value
    const supplierId = token ? await verifySessionToken(token) : null
    if (!supplierId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

    const { id: productId } = await params
    const { stock } = await req.json()

    if (typeof stock !== 'number' || stock < 0) {
      return NextResponse.json({ error: 'Stock invalide.' }, { status: 400 })
    }

    // verify ownership
    const myProducts = await getSupplierProducts(supplierId)
    if (!myProducts.find((p) => p.id === productId)) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })
    }

    await updateSupplierProductStock(productId, supplierId, stock)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[supplier/products/[id]]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
