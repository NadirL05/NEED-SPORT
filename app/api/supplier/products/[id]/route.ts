import { NextRequest, NextResponse } from 'next/server'
import { updateSupplierProductStock } from '@/lib/db/queries'
import { requireSupplierAuth, ok, err, isPositiveInt } from '@/lib/api'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const auth = await requireSupplierAuth()
    if (auth instanceof NextResponse) return auth

    const { id: productId } = await params
    if (!productId) return err('ID produit manquant.', 400)

    const body = await req.json()
    if (!isPositiveInt(body?.stock)) {
      return err('Stock invalide (entier >= 0 attendu).', 400)
    }

    const updated = await updateSupplierProductStock(productId, auth.supplierId, body.stock)
    if (!updated) return err('Produit introuvable ou non autorisé.', 404)

    return ok({ ok: true })
  } catch (e) {
    console.error('[supplier/products/[id]]', e)
    return err('Erreur serveur.', 500)
  }
}
