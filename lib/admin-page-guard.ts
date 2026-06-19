import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminSessionToken, ADMIN_COOKIE } from './admin-auth'

/**
 * Defense-in-depth guard for admin Server Component pages.
 *
 * The proxy/middleware already protects `/admin/*`, but relying on middleware
 * alone is risky (cf. CVE-2025-29927 middleware-bypass class). Call this at the
 * top of every admin page that reads data server-side so the page fails closed
 * even if the middleware layer is ever bypassed or misconfigured.
 */
export async function requireAdminPage(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  const valid = token ? await verifyAdminSessionToken(token) : false
  if (!valid) redirect('/admin/login')
}
