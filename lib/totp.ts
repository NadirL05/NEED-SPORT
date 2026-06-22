// RFC 6238 TOTP (and RFC 4226 HOTP) implemented with the Web Crypto API so it
// runs in both the Node.js and Edge runtimes — no external dependency.

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of clean) {
    const idx = BASE32.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  const buf = new ArrayBuffer(out.length)
  const arr = new Uint8Array(buf)
  arr.set(out)
  return arr
}

function base32Encode(data: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of data) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31]
  return out
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hotp(secret: Uint8Array<ArrayBuffer>, counter: number): Promise<string> {
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  view.setUint32(0, Math.floor(counter / 2 ** 32))
  view.setUint32(4, counter >>> 0)
  const key = await crypto.subtle.importKey(
    'raw', secret, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  )
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))
  const offset = sig[sig.length - 1] & 0x0f
  const bin =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff)
  return (bin % 1_000_000).toString().padStart(6, '0')
}

/**
 * Verify a 6-digit TOTP code against a base32 secret.
 * Accepts a ±`window` step drift (default 1 step = ±30 s) for clock skew.
 */
export async function verifyTotp(
  token: string,
  secretBase32: string,
  opts?: { window?: number; period?: number; t?: number },
): Promise<boolean> {
  const code = (token ?? '').replace(/\D/g, '')
  if (code.length !== 6) return false
  const period = opts?.period ?? 30
  const window = opts?.window ?? 1
  const now    = opts?.t ?? Date.now()
  const secret = base32Decode(secretBase32)
  if (secret.length === 0) return false
  const counter = Math.floor(now / 1000 / period)
  for (let i = -window; i <= window; i++) {
    const candidate = await hotp(secret, counter + i)
    if (timingSafeEqualStr(candidate, code)) return true
  }
  return false
}

/** Generate a new random base32 TOTP secret (160-bit by default). */
export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(bytes)))
}

/** Build an otpauth:// URL for QR enrollment in an authenticator app. */
export function otpauthUrl(secretBase32: string, label: string, issuer: string): string {
  const l = encodeURIComponent(label)
  const i = encodeURIComponent(issuer)
  return `otpauth://totp/${i}:${l}?secret=${secretBase32}&issuer=${i}&algorithm=SHA1&digits=6&period=30`
}
