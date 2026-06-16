import { NextRequest, NextResponse } from 'next/server'
import { updateSupplierStatus } from '@/lib/db/queries'
import { requireAdminAuth, ok, err } from '@/lib/api'

const VALID_STATUSES = ['active', 'pending', 'suspended'] as const
type Status = typeof VALID_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const auth = await requireAdminAuth()
    if (auth !== true) return auth

    const { id } = await params
    const { status } = await req.json() as { status?: string }

    if (!status || !VALID_STATUSES.includes(status as Status)) {
      return err('Statut invalide (active | pending | suspended).', 400)
    }

    await updateSupplierStatus(id, status as Status)
    return ok({ ok: true })
  } catch (e) {
    console.error('[admin/suppliers/[id]]', e)
    return err('Erreur serveur.', 500)
  }
}
