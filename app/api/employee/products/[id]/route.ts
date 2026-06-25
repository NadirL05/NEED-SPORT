import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'
import z from 'zod'
import { getProductImageValidationError, productRevalidationTargets } from '@/lib/product-images'

const updateEmployeeProductSchema = z.object({
  club: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(120).optional(),
  priceEur: z.number().int().positive().optional(),
  compareAtPriceEur: z.number().int().positive().nullable().optional(),
  cat: z.array(z.string()).optional(),
  img: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
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
  const raw = await req.json()
  const parsed = updateEmployeeProductSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.img !== undefined) {
    const imageError = getProductImageValidationError(parsed.data.img)
    if (imageError) return NextResponse.json({ error: imageError }, { status: 400 })
  }

  const [row] = await db.update(products).set({
    club:              parsed.data.club,
    name:              parsed.data.name,
    priceEur:          parsed.data.priceEur,
    compareAtPriceEur: parsed.data.compareAtPriceEur,
    cat:               parsed.data.cat,
    img:               parsed.data.img,
    stock:             parsed.data.stock,
    active:            parsed.data.active,
    seoTitle:          parsed.data.seoTitle,
    seoDescription:    parsed.data.seoDescription,
  }).where(eq(products.id, id)).returning({ id: products.id })

  if (!row) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  for (const target of productRevalidationTargets(id)) {
    revalidatePath(target.path, target.type)
  }

  return NextResponse.json(row)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id } = await params
  await db.update(products).set({ active: false }).where(eq(products.id, id))

  revalidatePath('/')
  revalidatePath('/shop')

  return NextResponse.json({ ok: true })
}
