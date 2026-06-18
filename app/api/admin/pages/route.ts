import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/api'

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await db.select().from(pages).orderBy(desc(pages.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const body = await req.json() as {
    id: string; title: string; content?: string
    seoTitle?: string | null; seoDescription?: string | null
    published?: boolean
  }

  if (!body.id || !body.title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [row] = await db.insert(pages).values({
    id:             body.id,
    title:          body.title,
    content:        body.content        ?? '',
    seoTitle:       body.seoTitle       ?? null,
    seoDescription: body.seoDescription ?? null,
    published:      body.published      ?? false,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
