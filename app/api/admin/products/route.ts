import { NextRequest, NextResponse, after } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireAdminAuth } from '@/lib/api'
import { auditAdminAction } from '@/lib/admin-audit'
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

  for (const target of productRevalidationTargets(row.id)) {
    revalidatePath(target.path, target.type)
  }
  auditAdminAction({ action: 'create', resource: 'product', resourceId: row.id, summary: `Créé: ${row.name}` })

  // Sync to Stripe in background — never blocks the 201 response.
  // stripeProductId is updated asynchronously; null in the meantime is safe
  // because checkout uses priceEur from our DB, not Stripe product IDs.
  after(async () => {
    try {
      const stripeProductId = await syncStripeProduct(row)
      await db.update(products).set({ stripeProductId }).where(eq(products.id, row.id))
    } catch (err) {
      console.error('[stripe] syncStripeProduct failed for product', row.id, err)
    }
  })

  return NextResponse.json(row, { status: 201 })
}
