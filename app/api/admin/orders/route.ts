import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/db/queries'
import { requireAdminAuth } from '@/lib/api'

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await getOrders()
  return NextResponse.json(rows)
}
