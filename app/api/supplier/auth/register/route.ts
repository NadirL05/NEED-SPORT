import { NextRequest, NextResponse } from 'next/server'
import { createSupplier, getSupplierByEmail } from '@/lib/db/queries'
import { hashPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/supplier-auth'

export async function POST(req: NextRequest) {
  const { email, password, companyName, contactName, phone, country } = await req.json()

  if (!email || !password || !companyName || !contactName) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min).' }, { status: 400 })
  }

  const existing = await getSupplierByEmail(email)
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const supplier = await createSupplier({
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    companyName: companyName.trim(),
    contactName: contactName.trim(),
    phone: phone?.trim() ?? null,
    country: country ?? 'FR',
    status: 'active',
  })

  const token = await createSessionToken(supplier.id)
  const res = NextResponse.json({
    supplier: { id: supplier.id, email: supplier.email, companyName: supplier.companyName, status: supplier.status },
  }, { status: 201 })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return res
}
