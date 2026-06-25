/**
 * Admin 2FA enrollment helper.
 *
 *   npm run admin:2fa
 *
 * Prints a fresh TOTP secret + an otpauth:// URL. Scan the URL in Google
 * Authenticator / Authy / 1Password, then set ADMIN_TOTP_SECRET (in Vercel and
 * .env.local) to the printed secret. Once set, the admin login requires the
 * 6-digit code in addition to the password.
 */
import { generateTotpSecret, otpauthUrl } from '../lib/totp'

const secret = generateTotpSecret()
const label  = process.env.ADMIN_EMAIL || 'admin'
const url    = otpauthUrl(secret, label, 'NEEDFOOT Admin')

console.log('\n=== NEEDFOOT — Admin 2FA setup ===\n')
console.log('1) Ajoute cette variable d\'environnement (Vercel + .env.local) :\n')
console.log(`   ADMIN_TOTP_SECRET=${secret}\n`)
console.log('2) Scanne cette URL otpauth dans ton app d\'authentification :\n')
console.log(`   ${url}\n`)
console.log('   (Génère un QR depuis cette URL, ou saisis le secret manuellement.)')
console.log('\n3) Reconnecte-toi : le login admin demandera désormais le code à 6 chiffres.\n')
