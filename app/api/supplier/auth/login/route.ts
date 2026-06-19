import { NextRequest, NextResponse } from 'next/server'
import { getSupplierByEmail } from '@/lib/db/queries'
import { verifyPassword, createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/supplier-auth'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
    }

    const ipLimited = await enforceRateLimit(`supplier-login:ip:${getClientIp(req)}`, 30, 60)
    if (ipLimited) return ipLimited
    const emailKey = String(email).toLowerCase().trim()
    const emailLimited = await enforceRateLimit(`supplier-login:email:${emailKey}`, 10, 900, 'Trop de tentatives pour ce compte. Réessayez dans quelques minutes.')
    if (emailLimited) return emailLimited

    const supplier = await getSupplierByEmail(email)
    if (!supplier) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    const valid = await verifyPassword(password, supplier.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    if (supplier.status === 'suspended') {
      return NextResponse.json({ error: 'Compte suspendu. Contactez le support.' }, { status: 403 })
    }

    const token = await createSessionToken(supplier.id)
    const res = NextResponse.json({
      supplier: { id: supplier.id, email: supplier.email, companyName: supplier.companyName, status: supplier.status },
    })
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
    return res
  } catch (err) {
    console.error('[supplier/login]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
