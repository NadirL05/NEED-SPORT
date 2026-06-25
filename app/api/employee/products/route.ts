import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getProductImageValidationError, productRevalidationTargets } from '@/lib/product-images'
import { syncStripeProduct } from '@/lib/stripe'

const productImageSchema = z.string().superRefine((value, context) => {
  const error = getProductImageValidationError(value)
  if (error) context.addIssue({ code: 'custom', message: error })
})

const createProductSchema = z.object({
  id:                z.string().min(1),
  club:              z.string().min(1),
  name:              z.string().min(1),
  priceEur:          z.number().int().positive(),
  compareAtPriceEur: z.number().int().positive().nullable().optional(),
  cat:               z.array(z.string()),
  img:               productImageSchema,
  stock:             z.number().int().nonnegative().optional().default(100),
  active:            z.boolean().optional().default(true),
  seoTitle:          z.string().nullable().optional(),
  seoDescription:    z.string().nullable().optional(),
})

async function getEmployeeId(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token) return null
  return verifyEmployeeToken(token)
}

export async function GET(): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const rows = await db.select().from(products).orderBy(products.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const parsed = createProductSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Requête invalide.', details: parsed.error.flatten() },
      { status: 400 },
    )
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
    active:            body.active,
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
