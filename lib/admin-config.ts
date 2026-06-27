// Fail-closed: in production, 2FA is mandatory.
// Without this check, a missing ADMIN_TOTP_SECRET silently bypasses the second factor.
export function validateAdminConfig(env: NodeJS.ProcessEnv): { error: string } | null {
  if (!env.ADMIN_SECRET) return { error: 'Server misconfigured.' }
  if (env.NODE_ENV === 'production' && !env.ADMIN_TOTP_SECRET) {
    console.error('[admin/login] ADMIN_TOTP_SECRET is required in production')
    return { error: 'Server misconfigured.' }
  }
  return null
}
