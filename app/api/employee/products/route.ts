import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'

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

  const body = await req.json() as {
    id: string; club: string; name: string; priceEur: number
    compareAtPriceEur?: number | null
    cat: string[]; img: string; stock?: number; active?: boolean
    seoTitle?: string | null; seoDescription?: string | null
  }

  if (!body.id || !body.club || !body.name || !body.priceEur) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
  }

  const [row] = await db.insert(products).values({
    id:                body.id,
    club:              body.club,
    name:              body.name,
    priceEur:          body.priceEur,
    compareAtPriceEur: body.compareAtPriceEur ?? null,
    cat:               body.cat ?? [],
    img:               body.img ?? '',
    stock:             body.stock ?? 100,
    active:            body.active ?? true,
    seoTitle:          body.seoTitle ?? null,
    seoDescription:    body.seoDescription ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
