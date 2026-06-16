import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, sessionCookieOptions } from '@/lib/supplier-auth'

const ADMIN_COOKIE = 'admin_session'
const ADMIN_MAX_AGE = 60 * 60 * 24 * 7

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { password } = await req.json() as { password?: string }
    const secret = process.env.ADMIN_SECRET

    if (!secret) return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
    if (!password || password !== secret) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
    }

    // Store a signed token, never the raw secret
    const token = await createSessionToken('admin')
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions(ADMIN_MAX_AGE))
    return res
  } catch (e) {
    console.error('[admin/login]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
