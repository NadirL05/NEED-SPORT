import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from './employee-auth'

/**
 * Defense-in-depth guard for employee Server Component layouts/pages.
 *
 * The middleware already protects `/employee/*`, but relying on middleware
 * alone is risky (cf. CVE-2025-29927 middleware-bypass class). Call this at the
 * top of the employee layout so every employee segment fails closed even if
 * the middleware layer is ever bypassed or misconfigured.
 */
export async function requireEmployeePage(): Promise<void> {
  const token = (await cookies()).get(EMPLOYEE_COOKIE)?.value
  const valid = token ? await verifyEmployeeToken(token) : null
  if (!valid) redirect('/employee/login')
}
