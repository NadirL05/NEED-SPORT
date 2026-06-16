import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/supplier-auth'

const PUBLIC_SUPPLIER_PATHS = ['/supplier/login', '/supplier/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

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
  matcher: ['/supplier/:path*'],
}
