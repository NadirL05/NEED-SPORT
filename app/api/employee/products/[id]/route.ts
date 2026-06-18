import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'

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
  const body = await req.json() as {
    club?: string; name?: string; priceEur?: number
    compareAtPriceEur?: number | null
    cat?: string[]; img?: string; stock?: number; active?: boolean
    seoTitle?: string | null; seoDescription?: string | null
  }

  const [row] = await db.update(products).set({
    club:              body.club,
    name:              body.name,
    priceEur:          body.priceEur,
    compareAtPriceEur: body.compareAtPriceEur,
    cat:               body.cat,
    img:               body.img,
    stock:             body.stock,
    active:            body.active,
    seoTitle:          body.seoTitle,
    seoDescription:    body.seoDescription,
  }).where(eq(products.id, id)).returning()

  if (!row) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })
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
  return NextResponse.json({ ok: true })
}
