import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { adminAuditLog } from '@/lib/db/schema'
import { requireAdminAuth } from '@/lib/api'
import { desc } from 'drizzle-orm'

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await db.select().from(adminAuditLog)
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(200)
  return NextResponse.json(rows)
}
