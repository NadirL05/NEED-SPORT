import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireAdminAuth } from '@/lib/api'
import { getProductImageValidationError, productRevalidationTargets } from '@/lib/product-images'
import { revalidatePath } from 'next/cache'
import { syncStripeProduct } from '@/lib/stripe'

const productImageSchema = z.string().superRefine((value, context) => {
  const error = getProductImageValidationError(value)
  if (error) context.addIssue({ code: 'custom', message: error })
})

const createProductSchema = z.object({
  id:                z.string().min(1),
  club:              z.string().min(1),
  name:              z.string().min(1),
  priceEur:          z.number().positive(),
  compareAtPriceEur: z.number().positive().nullable().optional(),
  cat:               z.array(z.string()),
  supplierId:        z.string().nullable().optional(),
  img:               productImageSchema,
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
    supplierId:        body.supplierId || null,
    img:               body.img,
    stock:             body.stock,
    active:            true,
    seoTitle:          body.seoTitle ?? null,
    seoDescription:    body.seoDescription ?? null,
  }).returning()

  try {
    const stripeProductId = await syncStripeProduct(row)
    const [updated] = await db.update(products)
      .set({ stripeProductId })
      .where(eq(products.id, row.id))
      .returning()
    for (const target of productRevalidationTargets(row.id)) {
      revalidatePath(target.path, target.type)
    }
    return NextResponse.json(updated, { status: 201 })
  } catch {
    for (const target of productRevalidationTargets(row.id)) {
      revalidatePath(target.path, target.type)
    }
    return NextResponse.json(row, { status: 201 })
  }
}
