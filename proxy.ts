import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/supplier-auth'
import { verifyAdminSessionToken, ADMIN_COOKIE } from '@/lib/admin-auth'

const PUBLIC_SUPPLIER_PATHS = ['/supplier/login', '/supplier/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ─── Admin API protection ────────────────────────────────────────────────────
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const valid = token ? await verifyAdminSessionToken(token) : false
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // ─── Admin page protection ───────────────────────────────────────────────────
  // Pages under /admin/* are Server Components that render business data (orders,
  // revenue, customer emails). They must be gated just like the admin API.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const valid = token ? await verifyAdminSessionToken(token) : false
    if (!valid) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ─── Supplier page protection ─────────────────────────────────────────────
  if (!pathname.startsWith('/supplier')) return NextResponse.next()
  if (PUBLIC_SUPPLIER_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const supplierId = token ? await verifySessionToken(token) : null

  if (!supplierId) {
    const url = req.nextUrl.clone()
    url.pathname = '/supplier/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  const res = NextResponse.next()
  res.headers.set('x-supplier-id', supplierId)
  return res
}

export const config = {
  matcher: ['/supplier/:path*', '/admin/:path*', '/api/admin/:path*'],
}
