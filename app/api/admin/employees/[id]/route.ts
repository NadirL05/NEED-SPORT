import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { employees } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/api'
import { hashPassword } from '@/lib/supplier-auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params
  const body = await req.json() as { name?: string; active?: boolean; password?: string }

  const update: Partial<typeof employees.$inferInsert> = {}
  if (body.name     !== undefined) update.name   = body.name
  if (body.active   !== undefined) update.active = body.active
  if (body.password)               update.passwordHash = await hashPassword(body.password)

  const [row] = await db.update(employees).set(update).where(eq(employees.id, id)).returning()
  if (!row) return NextResponse.json({ error: 'Employé introuvable.' }, { status: 404 })

  return NextResponse.json({ id: row.id, email: row.email, name: row.name, active: row.active })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params
  await db.update(employees).set({ active: false }).where(eq(employees.id, id))
  return NextResponse.json({ ok: true })
}
