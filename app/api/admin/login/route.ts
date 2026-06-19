import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, adminCookieOptions, ADMIN_COOKIE } from '@/lib/admin-auth'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { verifyTotp } from '@/lib/totp'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Brute-force protection: 10 attempts per IP per 15 min.
    const limited = await enforceRateLimit(
      `admin-login:ip:${getClientIp(req)}`, 10, 900,
      'Trop de tentatives. Réessayez dans quelques minutes.',
    )
    if (limited) return limited

    const { password, token } = await req.json() as { password?: string; token?: string }
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

    // Second factor (TOTP) — enforced only when ADMIN_TOTP_SECRET is configured,
    // so deployments without 2FA keep working until enrollment (npm run admin:2fa).
    const totpSecret = process.env.ADMIN_TOTP_SECRET
    if (totpSecret) {
      if (!token) {
        return NextResponse.json({ error: 'Code 2FA requis.', twoFactorRequired: true }, { status: 401 })
      }
      const validTotp = await verifyTotp(token, totpSecret)
      if (!validTotp) {
        return NextResponse.json({ error: 'Code 2FA invalide.', twoFactorRequired: true }, { status: 401 })
      }
    }

    const sessionToken = await createAdminSessionToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_COOKIE, sessionToken, adminCookieOptions())
    return res
  } catch (e) {
    console.error('[admin/login]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true })
  // Keep httpOnly/secure flags consistent while clearing the cookie.
  res.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0))
  return res
}
