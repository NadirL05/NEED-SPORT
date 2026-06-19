import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { employees } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, sessionCookieOptions } from '@/lib/supplier-auth'
import { createEmployeeToken, EMPLOYEE_COOKIE, EMPLOYEE_MAX_AGE } from '@/lib/employee-auth'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
    }

    const ipLimited = await enforceRateLimit(`employee-login:ip:${getClientIp(req)}`, 30, 60)
    if (ipLimited) return ipLimited
    const emailLimited = await enforceRateLimit(`employee-login:email:${email.toLowerCase().trim()}`, 10, 900, 'Trop de tentatives pour ce compte. Réessayez dans quelques minutes.')
    if (emailLimited) return emailLimited

    const [emp] = await db.select().from(employees).where(eq(employees.email, email.toLowerCase()))
    if (!emp || !emp.active) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    const ok = await verifyPassword(password, emp.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    const token = await createEmployeeToken(emp.id)
    const res = NextResponse.json({ ok: true, name: emp.name })
    res.cookies.set(EMPLOYEE_COOKIE, token, sessionCookieOptions(EMPLOYEE_MAX_AGE))
    return res
  } catch (e) {
    console.error('[employee/login]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(EMPLOYEE_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
