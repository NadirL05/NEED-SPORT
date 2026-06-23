import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdminAuth } from '@/lib/api'
import { getProductImageValidationError, productRevalidationTargets } from '@/lib/product-images'
import { revalidatePath } from 'next/cache'

const productImageSchema = z.string().superRefine((value, context) => {
  const error = getProductImageValidationError(value)
  if (error) context.addIssue({ code: 'custom', message: error })
})

const updateProductSchema = z.object({
  club:              z.string().min(1).optional(),
  name:              z.string().min(1).optional(),
  priceEur:          z.number().positive().optional(),
  compareAtPriceEur: z.number().positive().nullable().optional(),
  cat:               z.array(z.string()).optional(),
  supplierId:        z.string().nullable().optional(),
  img:               productImageSchema.optional(),
  stock:             z.number().int().nonnegative().optional(),
  active:            z.boolean().optional(),
  seoTitle:          z.string().nullable().optional(),
  seoDescription:    z.string().nullable().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params

  const parsed = updateProductSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = { ...parsed.data }
  if (data.supplierId === '') data.supplierId = null

  const [row] = await db.update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  for (const target of productRevalidationTargets(id)) {
    revalidatePath(target.path, target.type)
  }
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const { id } = await params
  const [row] = await db.update(products)
    .set({ active: false })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  for (const target of productRevalidationTargets(id)) {
    revalidatePath(target.path, target.type)
  }
  return NextResponse.json({ ok: true })
}
