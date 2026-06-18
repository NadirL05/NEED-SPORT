import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, adminCookieOptions, ADMIN_COOKIE } from '@/lib/admin-auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { password } = await req.json() as { password?: string }
    const secret = process.env.ADMIN_SECRET

    if (!secret) return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
    if (!password) return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })

    // Timing-safe comparison to prevent timing attacks
    const a = Buffer.from(password)
    const b = Buffer.from(secret)
    let mismatch = a.length !== b.length ? 1 : 0
    const len = Math.min(a.length, b.length)
    for (let i = 0; i < len; i++) {
      mismatch |= a[i] ^ b[i]
    }
    if (mismatch !== 0) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
    }

    const token = await createAdminSessionToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions())
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
