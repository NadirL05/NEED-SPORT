import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/db/queries'

export async function GET() {
  const rows = await getOrders()
  return NextResponse.json(rows)
}
