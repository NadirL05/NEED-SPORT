import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(products).orderBy(products.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    id: string; club: string; name: string; priceEur: number
    cat: string[]; img: string; stock?: number
  }

  if (!body.id || !body.club || !body.name || !body.priceEur) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [row] = await db.insert(products).values({
    id:       body.id,
    club:     body.club,
    name:     body.name,
    priceEur: body.priceEur,
    cat:      body.cat ?? [],
    img:      body.img ?? '',
    stock:    body.stock ?? 100,
    active:   true,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
