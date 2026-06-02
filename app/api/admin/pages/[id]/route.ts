import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await db.select().from(pages).where(eq(pages.id, id))
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json() as Partial<{
    title: string; content: string; published: boolean
    seoTitle: string | null; seoDescription: string | null
  }>

  const [row] = await db.update(pages)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(pages).where(eq(pages.id, id))
  return NextResponse.json({ ok: true })
}
