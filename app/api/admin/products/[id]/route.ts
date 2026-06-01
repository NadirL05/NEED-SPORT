import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json() as Partial<{
    club: string; name: string; priceEur: number; cat: string[]
    img: string; stock: number; active: boolean
  }>

  const [row] = await db.update(products)
    .set({ ...body })
    .where(eq(products.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.update(products).set({ active: false }).where(eq(products.id, id))
  return NextResponse.json({ ok: true })
}
