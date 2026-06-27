import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'
import { getProductImageValidationError, productRevalidationTargets } from '@/lib/product-images'

async function getEmployeeId(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token) return null
  return verifyEmployeeToken(token)
}

const createEmployeeProductSchema = z.object({
  id: z.string().min(1).max(64),
  club: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  priceEur: z.number().int().positive(),
  compareAtPriceEur: z.number().int().positive().nullable().optional(),
  cat: z.array(z.string()).default([]),
  img: z.string().optional().default(''),
  stock: z.number().int().nonnegative().optional().default(100),
  active: z.boolean().optional().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
})

export async function GET(): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const rows = await db.select().from(products).orderBy(products.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const empId = await getEmployeeId()
  if (!empId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const parsed = createEmployeeProductSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  const imageError = getProductImageValidationError(data.img)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 400 })
  }

  const [row] = await db.insert(products).values({
    id:                data.id,
    club:              data.club,
    name:              data.name,
    priceEur:          data.priceEur,
    compareAtPriceEur: data.compareAtPriceEur ?? null,
    cat:               data.cat,
    img:               data.img,
    stock:             data.stock,
    active:            data.active,
    seoTitle:          data.seoTitle ?? null,
    seoDescription:    data.seoDescription ?? null,
  }).returning()

  for (const target of productRevalidationTargets(row.id)) {
    revalidatePath(target.path, target.type)
  }

  return NextResponse.json(row, { status: 201 })
}
