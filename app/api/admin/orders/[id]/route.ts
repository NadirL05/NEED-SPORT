import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/api'
import { auditAdminAction } from '@/lib/admin-audit'

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params
  const rows = await db.select().from(orders).where(eq(orders.id, id))
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params
  const { status } = await req.json() as { status?: string }

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const [row] = await db.update(orders)
    .set({ status })
    .where(eq(orders.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  auditAdminAction({ action: 'update', resource: 'order', resourceId: id, summary: `Statut → ${status}` })
  return NextResponse.json(row)
}
