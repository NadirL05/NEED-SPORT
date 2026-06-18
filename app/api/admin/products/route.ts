import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireAdminAuth } from '@/lib/api'

const createProductSchema = z.object({
  id:                z.string().min(1),
  club:              z.string().min(1),
  name:              z.string().min(1),
  priceEur:          z.number().positive(),
  compareAtPriceEur: z.number().positive().nullable().optional(),
  cat:               z.array(z.string()),
  img:               z.string().optional().default(''),
  stock:             z.number().int().nonnegative().optional().default(100),
  seoTitle:          z.string().nullable().optional(),
  seoDescription:    z.string().nullable().optional(),
})

export async function GET() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const rows = await db.select().from(products).orderBy(products.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const parsed = createProductSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const [row] = await db.insert(products).values({
    id:                body.id,
    club:              body.club,
    name:              body.name,
    priceEur:          body.priceEur,
    compareAtPriceEur: body.compareAtPriceEur ?? null,
    cat:               body.cat,
    img:               body.img,
    stock:             body.stock,
    active:            true,
    seoTitle:          body.seoTitle ?? null,
    seoDescription:    body.seoDescription ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
