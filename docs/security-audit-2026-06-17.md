# Security Audit Report — Need Sport (Next.js E-Commerce)

**Date:** 2026-06-17
**Audited project:** `/need-sport` (Next.js App Router, Drizzle ORM, Stripe, Vercel Blob)
**Auditor:** Claude Code (automated static analysis)

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| **Risk Score** | **18 / 100** (100 = fully secure) |
| **Overall Risk Level** | **CRITICAL** |
| **Total findings** | 44 |
| CRITICAL | 9 |
| HIGH | 19 |
| MEDIUM | 10 |
| LOW | 6 |
| False positives | 1 |

The application is not production-safe in its current state. The two root causes that generate the majority of critical exposure are:

1. **No authentication enforcement** — every `/api/admin/*` data route (products, orders, upload, pages) runs with zero session verification. Any anonymous HTTP client can read all business data, create/modify products, change order statuses, and upload files to the public blob store.
2. **Forgeable session tokens** — the HMAC signing secret falls back to the well-known hardcoded string `'dev-secret-change-in-production'`. Anyone who reads this source code can forge valid supplier or admin session cookies without knowing a real secret.

Fixing these two issues eliminates the vast majority of critical and high-severity exposure.

---

## 2. CRITICAL Findings

| # | Title | File(s) | Impact | Recommended Fix |
|---|---|---|---|---|
| C1 | **All `/api/admin/*` data routes are completely unauthenticated** | `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`, `app/api/admin/orders/route.ts` | Any anonymous caller can read all products/orders, create products, modify prices, soft-delete records. Business data fully exposed. | Create `lib/admin-auth.ts` with `requireAdminAuth()` that reads the `admin_session` cookie, calls `verifySessionToken()`, and returns 401 if invalid. Call it at the top of every admin route handler. Better: add `middleware.ts` at project root matching `/api/admin/((?!login).*)` to enforce auth in one place. |
| C2 | **HMAC secret falls back to hardcoded known constant** | `lib/supplier-auth.ts` (line 46-48) | `getSessionSecret()` returns `'dev-secret-change-in-production'` when `SUPPLIER_SESSION_SECRET` is absent. Anyone who reads this file can forge valid session tokens for any `supplierId` — including `'admin'`. | Remove the fallback entirely: `const secret = process.env.SUPPLIER_SESSION_SECRET; if (!secret) throw new Error('SUPPLIER_SESSION_SECRET is required');`. Generate a 32-byte secret: `openssl rand -hex 32`. Store in Vercel env vars. |
| C3 | **Admin products POST/PUT/DELETE have no authentication check** | `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts` | Unauthenticated callers can create, modify, or soft-delete any product. Contrast: `app/api/admin/suppliers/route.ts` correctly calls `requireAdminAuth()`. | Add `const auth = await requireAdminAuth(); if (auth !== true) return auth;` at the top of POST (products/route.ts) and PUT/DELETE (products/[id]/route.ts). Apply the same fix to `admin/pages/route.ts` POST and `admin/pages/[id]/route.ts` PUT/DELETE. |
| C4 | **Admin orders PATCH has no authentication check** | `app/api/admin/orders/[id]/route.ts` | Any anonymous caller can change any order status to `shipped`, `delivered`, or `cancelled`. The companion GET exposes full customer order data (addresses, Stripe session IDs) without auth. | Wrap both GET and PATCH with `requireAdminAuth()` from `lib/api.ts` before any DB access. |
| C5 | **Admin upload endpoint has no authentication check** | `app/api/admin/upload/route.ts` | Unauthenticated actors can upload arbitrary files to the public Vercel Blob store — running up costs and hosting malicious content. No MIME type allowlist exists. | 1) Add `requireAdminAuth()` at the top. 2) Add a MIME type allowlist: `['image/jpeg','image/png','image/webp','image/avif']`. 3) Add a max file size check via `file.size`. |
| C6 | **IDOR in `updateSupplierProductStock`: write before ownership check** | `lib/db/queries.ts` (lines 99-111) | The UPDATE runs against any `productId` first, then ownership is verified afterwards by a second SELECT. A supplier can overwrite another supplier's stock value before the function returns `false`. | Add `supplierId` to the WHERE clause of the UPDATE itself: `db.update(products).set({ stock }).where(and(eq(products.id, productId), eq(products.supplierId, supplierId)))`. Check `rowsAffected` to determine success atomically. |
| C7 | **No Content-Security-Policy header configured** | `next.config.ts` | No protection against XSS, script injection, clickjacking, or MIME sniffing. The app has no CSP anywhere (no `next.config.ts` headers, no `vercel.json`, no `_headers` file, no middleware). | Add a `headers()` export to `next.config.ts`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';`. Use a per-request nonce for SSR inline scripts. |
| C8 | **Admin login has no rate limiting or account lockout** | `app/api/admin/login/route.ts` | Brute-force at full Vercel serverless speed. No attempt counter, no lockout, no CAPTCHA, no IP throttling, no failed-attempt logging. A targeted attack is invisible until after credential compromise. | Add `@upstash/ratelimit` with a sliding window of 5 attempts per IP per 15 minutes. Return HTTP 429 with `Retry-After`. Log every failed attempt with timestamp and IP. Consider TOTP second factor. |
| C9 | **Supplier login has no rate limiting — credential stuffing unrestricted** | `app/api/supplier/auth/login/route.ts` | No per-IP or per-email attempt cap. bcrypt is slow per attempt but parallel credential stuffing is unblocked at scale. The suspended-account check on line 22 cannot substitute for lockout. | Apply rate limiter keyed on both IP and normalized email (e.g. 10 attempts per email per 15 minutes, 30 per IP per minute). Return 429 with `Retry-After`. Increment a failed-attempts counter in DB/Redis for progressive delays. |

---

## 3. HIGH Findings

| # | Title | File(s) | Impact | Recommended Fix |
|---|---|---|---|---|
| H1 | **No `middleware.ts` — no Edge-level route protection for `/api/admin/*`** | `middleware.ts` (missing) | No centralized enforcement. Any new admin route added without an auth call is silently unprotected. | Create `middleware.ts` at project root. Match `/api/admin/((?!login).*)`. Read `admin_session` cookie, call `verifySessionToken()`, return 401 for invalid tokens. |
| H2 | **Admin and supplier sessions share the same HMAC secret and signing function** | `lib/supplier-auth.ts`, `app/api/admin/login/route.ts` | A supplier token for `id='admin'` is structurally indistinguishable from an admin session token. Compromising one secret compromises both. | Introduce `lib/admin-auth.ts` with its own `ADMIN_SESSION_SECRET`, `createAdminSessionToken()`, and `verifyAdminSessionToken()`. Admin tokens should encode a fixed `role: 'admin'` claim, not a user-supplied id string. |
| H3 | **Session tokens contain no expiry — stolen tokens are valid forever** | `lib/supplier-auth.ts` | The `maxAge` cookie attribute is not verified server-side. A token intercepted via network, server log, or XSS remains valid until the secret is rotated. | Embed an expiry timestamp in the signed payload: `<supplierId>:<expiresAt>.<hmac>`. In `verifySessionToken()`, after HMAC verification, check `Date.now() < expiresAt`. |
| H4 | **Admin products GET exposes all products without authentication** | `app/api/admin/products/route.ts` | Leaks stock levels, supplier linkage, draft products, internal SEO fields to any unauthenticated caller. | Add `requireAdminAuth()` before the `db.select()` call. |
| H5 | **No Zod/schema validation on admin products POST — type-unsafe cast** | `app/api/admin/products/route.ts` | `await req.json() as {...}` provides zero runtime validation. Malformed payloads are forwarded directly to the DB insert. | Replace with a Zod schema using `safeParse`. Include: `id: z.string().min(1)`, `priceEur: z.number().positive()`, `cat: z.array(z.string())`, `stock: z.number().int().min(0).optional()`, etc. Return 400 with flattened errors on failure. |
| H6 | **No Zod/schema validation on admin products PUT — unrestricted spread into DB update** | `app/api/admin/products/[id]/route.ts` | `.set({ ...body })` where `body` is an unvalidated `Partial<...>`. A caller can inject unexpected columns (e.g. `supplierId`, `createdAt`) into the SET clause. | Validate and explicitly allowlist fields with a Zod `.partial()` schema. Build the update object from the parsed result only. |
| H7 | **Hardcoded fallback session secret in `supplier-auth.ts`** | `lib/supplier-auth.ts` (line 47) | Well-known fallback string `'dev-secret-change-in-production'` allows anyone with source access to forge session tokens in any environment where the env var is misconfigured. | Remove fallback. Throw at startup if absent. Use `@t3-oss/env-nextjs` for fail-fast env validation. |
| H8 | **No startup validation that `SUPPLIER_SESSION_SECRET` exists** | `lib/supplier-auth.ts` | Missing env var is silently masked. A misconfigured prod deployment appears to function normally while all tokens are signed with the known insecure key. | Add a module-level guard that throws (or logs fatal and exits) if the env var is missing or shorter than 32 characters. |
| H9 | **Non-constant-time password hash comparison** | `lib/supplier-auth.ts` (line 41) | `verifyPassword` compares PBKDF2 hex strings with JavaScript `===`. Short-circuit evaluation leaks timing information on the first differing character. | Use `crypto.subtle.verify` with an HMAC key, or encode both hashes as `Uint8Array` and compare with a constant-time byte-by-byte loop. |
| H10 | **Admin password compared with non-timing-safe equality** | `app/api/admin/login/route.ts` (line 13) | `password !== secret` short-circuits on the first differing byte. High-precision timing attack could enumerate correct secret character-by-character. | Use `crypto.subtle.verify` (HMAC trick) or a `timingSafeEqual` utility for the comparison. |
| H11 | **Missing X-Frame-Options header** | `next.config.ts` | Pages can be embedded in iframes on third-party sites, enabling clickjacking against authenticated users. | Add `{ key: 'X-Frame-Options', value: 'DENY' }` to the `headers()` array in `next.config.ts`. |
| H12 | **Missing X-Content-Type-Options header** | `next.config.ts` | Browsers may MIME-sniff responses and execute them as a different content type, enabling XSS in some scenarios. | Add `{ key: 'X-Content-Type-Options', value: 'nosniff' }` to the `headers()` array. |
| H13 | **Missing Referrer-Policy header** | `next.config.ts` | Full URL (including path and query params) may be sent to third-party destinations, leaking internal URL structure, user/product identifiers. | Add `{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }` to the `headers()` array. |
| H14 | **Wildcard hostname allowed for remote images** | `next.config.ts` | `hostname: '**'` allows the Next.js image optimizer to proxy images from any external host. Abusable as an open proxy for malicious/NSFW content, bypassing CSP `img-src`, increasing bandwidth costs. | Replace with an explicit allowlist of actual external image hostnames (e.g. your Supabase storage bucket, CDN). |
| H15 | **No rate limiting on admin login or supplier auth endpoints** | `app/api/admin/login/route.ts` | Admin login POST compares plain password with no throttle, no lockout, no delay on failure. Brute-force has no server-side barrier. | Add `@upstash/ratelimit` with sliding window. Enforce fixed delay on failed attempts. Return 429 after N consecutive failures. (See C8/C9 for full detail.) |
| H16 | **Checkout quantity and item count not upper-bounded** | `app/api/checkout/route.ts` | No upper bound on quantity (`>= 1` only) or total line items. Attacker can submit 9999 quantity or thousands of product IDs, triggering large DB batches and potentially hitting Stripe API rate limits, causing DoS for real customers. | 1) Guard: `if (payload.items.length > 50) return 400`. 2) Per-item: `item.quantity > 100`. 3) Add `product.stock >= item.quantity` check before Stripe session creation. |
| H17 | **No startup validation that `SUPPLIER_SESSION_SECRET` exists (duplicate)** | `lib/supplier-auth.ts` | See H8 above. | See H8. |
| H18 | **Supplier registration has no spam or bot protection** | `app/api/supplier/auth/register/route.ts` | No rate limiting. Bot can flood endpoint to exhaust DB connection pool, create thousands of junk accounts, and DoS via bcrypt CPU cost. Duplicate-email check is trivially bypassed with unique addresses. | Per-IP rate limit (3 registrations/IP/hour). Require email verification (`status: 'pending'`) before account is active. Consider CAPTCHA or proof-of-work. |
| H19 | **Checkout endpoint allows unlimited Stripe session creation per IP** | `app/api/checkout/route.ts` | No IP-level or session-level throttle. Can exhaust Stripe API quota (100 req/s live mode), breaking checkout for real customers. Also allows price-probing by enumerating product IDs. | Add per-IP rate limiter (10 checkout initiations/IP/minute). Use Stripe idempotency keys to deduplicate retries. |

---

## 4. MEDIUM / LOW Findings

| Severity | Title | File(s) | Note |
|---|---|---|---|
| MEDIUM | Cookie flags missing on logout (session clearing) | `app/api/admin/login/route.ts`, `app/api/supplier/auth/login/route.ts` | DELETE handlers omit `httpOnly` and `secure` flags on the clearing `Set-Cookie` header. Add both flags for consistency. |
| MEDIUM | Supplier status check occurs after session token is issued | `app/api/supplier/auth/login/route.ts` | Suspension check happens only at login. A supplier suspended post-login retains a valid token for up to 30 days. Re-verify `supplier.status` on every authenticated request. |
| MEDIUM | Admin orders GET leaks full customer PII without authentication | `app/api/admin/orders/route.ts` | Returns shipping addresses and Stripe session IDs to unauthenticated callers. Blocked by fixing C4. |
| MEDIUM | Admin pages POST/PUT/DELETE have no authentication check | `app/api/admin/pages/route.ts`, `app/api/admin/pages/[id]/route.ts` | Anonymous callers can inject arbitrary HTML into published CMS pages. Apply `requireAdminAuth()` to all three handlers. |
| MEDIUM | Supplier registration auto-activates accounts with `status: 'active'` | `app/api/supplier/auth/register/route.ts` (line 35) | Bypasses the pending/active/suspended lifecycle. Change default to `status: 'pending'` and require admin approval. |
| MEDIUM | No Zod/schema validation on admin pages POST body | `app/api/admin/pages/route.ts` | `content` and `seoDescription` accept arbitrary strings of unlimited length with no sanitization. Add Zod schema with length limits. |
| MEDIUM | Webhook secret missing check is a 500, not a startup guard | `app/api/webhooks/stripe/route.ts` (line 29) | Missing env var checked at request time, not cold-start. Stripe retries indefinitely on 500. Move check to module load; throw at startup. |
| MEDIUM | Wildcard hostname in Next.js Image `remotePatterns` enables SSRF | `next.config.ts` | `hostname: '**'` allows `/next/image` to proxy internal network addresses (169.254.x.x, 10.x.x.x, localhost). Replace with explicit allowlist. (See H14.) |
| MEDIUM | Missing Permissions-Policy header | `next.config.ts` | No restriction on camera, microphone, geolocation for third-party scripts. Add `{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }`. |
| MEDIUM | Missing Strict-Transport-Security (HSTS) header | `next.config.ts` | No HSTS. First-time visitors can be downgraded to HTTP. Vercel enforces HTTPS at edge but explicit HSTS adds defence-in-depth and enables preload list. Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. |
| LOW | Admin login uses `===` instead of timing-safe comparison | `app/api/admin/login/route.ts` (line 13) | See H10. Low exploitability in practice but non-compliant. |
| LOW | No file type validation on admin upload endpoint | `app/api/admin/upload/route.ts` | Extension extracted with `.split('.').pop()` only. Add MIME type allowlist. Blocked by adding auth (C5) anyway. |
| LOW | `orderId` generated with `Date.now() + Math.random()` — weak uniqueness | `app/api/webhooks/stripe/route.ts` (line 53) | Theoretical collision under concurrent retries. `stripeSessionId` UNIQUE constraint prevents duplicate orders but a collision in `orderId` causes an unhandled PK violation. Use `crypto.randomUUID()` instead. |
| LOW | `STRIPE_SECRET_KEY` confirmed safe (no `NEXT_PUBLIC_` prefix) | `lib/stripe.ts` | Confirmed: keys accessed via `process.env.*` without the `NEXT_PUBLIC_` prefix. Not bundled into client. **No action required.** |
| LOW | Checkout prices resolved server-side (confirmed safe) | `app/api/checkout/route.ts` | Confirmed: `unit_amount` always sourced from DB via `getProductsByIds`. No price injection vector. **No action required.** |
| LOW | `proxy.ts` does not apply security headers | `proxy.ts` | Middleware only sets `x-supplier-id`. Good location to also apply security headers globally once `middleware.ts` is introduced. |

---

## 5. Top 3 Immediate Actions

### Action 1 — Fix the hardcoded HMAC fallback (30 minutes)

**File:** `lib/supplier-auth.ts`

This single change neutralises the token-forgery threat for both supplier and admin sessions.

```ts
// lib/supplier-auth.ts — getSessionSecret()
function getSessionSecret(): string {
  const secret = process.env.SUPPLIER_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SUPPLIER_SESSION_SECRET env var is required and must be at least 32 characters'
    );
  }
  return secret;
}
```

Then generate and set the variable:
```bash
openssl rand -hex 32
# Add to Vercel → Settings → Environment Variables → SUPPLIER_SESSION_SECRET
```

Create a separate `ADMIN_SESSION_SECRET` with the same procedure and wire it to a new `lib/admin-auth.ts`.

---

### Action 2 — Add `middleware.ts` to protect all `/api/admin/*` routes (1 hour)

This is the highest-leverage security fix in the codebase — one file closes all 9 unauthenticated admin endpoints simultaneously.

```ts
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from './lib/admin-auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  if (!token || !(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/((?!login).*)'],
};
```

---

### Action 3 — Add security headers to `next.config.ts` (30 minutes)

```ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      // Replace wildcard with explicit hostnames
      { protocol: 'https', hostname: 'your-bucket.supabase.co' },
    ],
  },
};
```

---

## 6. False Positives

| Finding | Verdict |
|---|---|
| **Duplicate `orderItems` on Stripe webhook retry** | **INVALID as stated.** The schema defines a NOT NULL foreign key on `orderItems.orderId → orders.id`. On a webhook retry, line 53 generates a brand-new random `orderId` that was never inserted into `orders` (the prior insert was swallowed by `.onConflictDoNothing()`). PostgreSQL's FK constraint rejects the `orderItems` insert on retry — no duplicate rows are created. The real bug is the opposite: an unhandled FK violation exception on every Stripe retry, causing Stripe to exhaust its retry budget without receiving the idempotent 200 it expects. Fix: check whether the `stripeSessionId` already has a corresponding order before attempting insertion, and return 200 early if so. |

---

## Appendix — Severity Definitions

| Level | Meaning |
|---|---|
| CRITICAL | Exploitable without authentication, leads to data loss, account takeover, or financial fraud |
| HIGH | Exploitable with low effort or authenticated context; significant data exposure or system abuse |
| MEDIUM | Requires specific conditions; increases attack surface or violates security best practices |
| LOW | Theoretical or low-impact; defence-in-depth improvements |
