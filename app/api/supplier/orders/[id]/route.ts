import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { requireSupplierAuth, ok, err } from '@/lib/api'
import { getSupplierOrders } from '@/lib/db/queries'

const ALLOWED_TRANSITIONS: Record<string, string> = {
  paid:    'shipped',
  shipped: 'delivered',
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const auth = await requireSupplierAuth()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json() as { status?: string }

    if (!body.status) return err('status requis.', 400)

    // Verify the order belongs to this supplier
    const supplierOrders = await getSupplierOrders(auth.supplierId)
    const order = supplierOrders.find(o => o.id === id)
    if (!order) return err('Commande introuvable.', 404)

    // Only allow valid transitions
    const expected = ALLOWED_TRANSITIONS[order.status]
    if (!expected || body.status !== expected) {
      return err(`Transition invalide: ${order.status} → ${body.status}`, 400)
    }

    await db.update(orders).set({ status: body.status }).where(eq(orders.id, id))
    return ok({ id, status: body.status })
  } catch (e) {
    console.error('[supplier/orders/PATCH]', e)
    return err('Erreur serveur.', 500)
  }
}
