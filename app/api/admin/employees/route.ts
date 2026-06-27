import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { employees } from '@/lib/db/schema'
import { requireAdminAuth } from '@/lib/api'
import { auditAdminAction } from '@/lib/admin-audit'
import { hashPassword } from '@/lib/supplier-auth'

export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await db.select({
    id:        employees.id,
    email:     employees.email,
    name:      employees.name,
    active:    employees.active,
    createdAt: employees.createdAt,
  }).from(employees).orderBy(employees.createdAt)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const body = await req.json() as { id?: string; email?: string; name?: string; password?: string }
  if (!body.id || !body.email || !body.name || !body.password) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
  }

  const passwordHash = await hashPassword(body.password)

  const [row] = await db.insert(employees).values({
    id:           body.id,
    email:        body.email.toLowerCase(),
    name:         body.name,
    passwordHash,
    active:       true,
  }).returning()

  auditAdminAction({ action: 'create', resource: 'employee', resourceId: row.id, summary: `Créé: ${row.name} (${row.email})` })
  return NextResponse.json({ id: row.id, email: row.email, name: row.name, active: row.active }, { status: 201 })
}
