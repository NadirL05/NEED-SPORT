import { NextRequest, NextResponse } from 'next/server'
import { createSupplier, getSupplierByEmail } from '@/lib/db/queries'
import { hashPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/supplier-auth'
import { ok, err, isValidEmail, isNonEmptyString } from '@/lib/api'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email, password, companyName, contactName, phone, country } = body

    if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(companyName) || !isNonEmptyString(contactName)) {
      return err('Champs obligatoires manquants.', 400)
    }
    if (!isValidEmail(email)) {
      return err('Adresse email invalide.', 400)
    }
    if (password.length < 8) {
      return err('Mot de passe trop court (8 caractères min).', 400)
    }

    const existing = await getSupplierByEmail(email.toLowerCase().trim())
    if (existing) {
      return err('Un compte existe déjà avec cet email.', 409)
    }

    const passwordHash = await hashPassword(password)
    const supplier = await createSupplier({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      passwordHash,
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      phone: isNonEmptyString(phone) ? phone.trim() : null,
      country: typeof country === 'string' && country.length === 2 ? country : 'FR',
      status: 'pending',
    })

    const token = await createSessionToken(supplier.id)
    const res = ok(
      { supplier: { id: supplier.id, email: supplier.email, companyName: supplier.companyName } },
      201,
    )
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (e) {
    console.error('[supplier/register]', e)
    return err('Erreur serveur.', 500)
  }
}
