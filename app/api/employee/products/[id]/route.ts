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

const updateProductSchema = z.object({
  club:              z.string().min(1).optional(),
  name:              z.string().min(1).optional(),
  priceEur:          z.number().int().positive().optional(),
  compareAtPriceEur: z.number().int().positive().nullable().optional(),
  cat:               z.array(z.string()).optional(),
  img:               productImageSchema.optional(),
  stock:             z.number().int().nonnegative().optional(),
  active:            z.boolean().optional(),
  seoTitle:          z.string().nullable().optional(),
  seoDescription:    z.string().nullable().optional(),
})

async function getEmployeeId(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token) return null
  return verifyEmployeeToken(token)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id } = await params
  const parsed = updateProductSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Requête invalide.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const [row] = await db.update(products)
    .set(parsed.data)
    .where(eq(products.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  try {
    const stripeProductId = await syncStripeProduct(row)
    const [updated] = await db.update(products)
      .set({ stripeProductId })
      .where(eq(products.id, id))
      .returning()
    for (const target of productRevalidationTargets(id)) {
      revalidatePath(target.path, target.type)
    }
    return NextResponse.json(updated ?? row)
  } catch {
    for (const target of productRevalidationTargets(id)) {
      revalidatePath(target.path, target.type)
    }
    return NextResponse.json(row)
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id } = await params
  const [row] = await db.update(products)
    .set({ active: false })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!row) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  for (const target of productRevalidationTargets(id)) {
    revalidatePath(target.path, target.type)
  }
  return NextResponse.json({ ok: true })
}
