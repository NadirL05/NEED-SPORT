import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, SESSION_COOKIE } from './supplier-auth'
import { getSupplierById } from './db/queries'

/**
 * Defense-in-depth guard for supplier Server Component layouts/pages.
 *
 * The middleware already protects `/supplier/*`, but relying on middleware
 * alone is risky (cf. CVE-2025-29927 middleware-bypass class). Call this at the
 * top of the supplier layout so every supplier segment fails closed even if
 * the middleware layer is ever bypassed or misconfigured. Also re-checks the
 * live account status so a 30-day session cannot outlive a suspension.
 */
export async function requireSupplierPage(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const supplierId = token ? await verifySessionToken(token) : null
  if (!supplierId) redirect('/supplier/login')
  const supplier = await getSupplierById(supplierId)
  if (!supplier || supplier.status === 'suspended') redirect('/supplier/login')
}
