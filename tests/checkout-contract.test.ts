import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const src = readFileSync(join(ROOT, 'app/api/checkout/route.ts'), 'utf8')

describe('[checkout] source-code contracts', () => {
  // ── Rate limiting ─────────────────────────────────────────────────────────

  it('[checkout] guard: enforceRateLimit is the first call in POST, before any payload validation', () => {
    const postHandlerPos = src.indexOf('export async function POST')
    const rateLimitPos = src.indexOf('enforceRateLimit(', postHandlerPos)
    const payloadItemsPos = src.indexOf('payload.items', postHandlerPos)
    assert.ok(postHandlerPos >= 0, 'POST handler must be exported')
    assert.ok(rateLimitPos >= 0, 'enforceRateLimit must be present in POST handler')
    assert.ok(payloadItemsPos >= 0, 'payload.items must be referenced in POST handler')
    assert.ok(
      rateLimitPos < payloadItemsPos,
      'enforceRateLimit must precede payload.items — rate limit fires before any business logic',
    )
  })

  // ── Cart validation ───────────────────────────────────────────────────────

  it('[checkout] validation: empty cart returns 400', () => {
    assert.match(
      src,
      /!payload\.items\?\.length/,
      '!payload.items?.length guard must be present to reject empty carts with 400',
    )
  })

  it('[checkout] validation: quantity greater than 100 is rejected with 400', () => {
    assert.match(
      src,
      /item\.quantity\s*>\s*100/,
      'item.quantity > 100 check must be present to enforce per-item quantity ceiling',
    )
  })

  it('[checkout] validation: inactive product is rejected with 400', () => {
    assert.match(
      src,
      /!product\.active/,
      '!product.active check must be present to block unavailable products at checkout',
    )
  })

  // ── Server-side price integrity ───────────────────────────────────────────

  it('[checkout] price-integrity: product prices are fetched from DB via getProductsByIds', () => {
    assert.match(
      src,
      /getProductsByIds\(productIds\)/,
      'getProductsByIds must be called — prices must come from the DB, never from the client payload',
    )
  })

  it('[checkout] price-integrity: unit_amount is computed by unitPriceCents from DB product, not from payload', () => {
    assert.match(
      src,
      /unitPriceCents\(product\.priceEur, options, isVintage\)/,
      'unitPriceCents must be called with server-fetched product.priceEur',
    )
    assert.match(
      src,
      /unit_amount:\s*unitAmount/,
      'unit_amount in line_items must reference the server-computed unitAmount variable',
    )
    assert.doesNotMatch(
      src,
      /unit_amount:\s*.*?payload/,
      'unit_amount must never be sourced directly from the client payload',
    )
  })

  // ── Server-configuration guard ────────────────────────────────────────────

  it('[checkout] guard: NEXT_PUBLIC_URL is validated before checkout.sessions.create to prevent open-redirect', () => {
    const baseUrlGuardPos = src.indexOf('if (!baseUrl)')
    const createSessionPos = src.indexOf('checkout.sessions.create(')
    assert.ok(baseUrlGuardPos >= 0, 'if (!baseUrl) guard must be present')
    assert.ok(createSessionPos >= 0, 'checkout.sessions.create must be present')
    assert.ok(
      baseUrlGuardPos < createSessionPos,
      'NEXT_PUBLIC_URL must be validated before creating the Stripe session',
    )
  })

  // ── Promo code XOR ───────────────────────────────────────────────────────

  it('[checkout] promo: allow_promotion_codes and discounts are mutually exclusive via a single XOR spread', () => {
    // Both branches must exist in a ternary rooted on stripeCouponId
    const xorStartPos = src.indexOf('...(stripeCouponId')
    const discountsPos = src.indexOf('discounts:', xorStartPos)
    const allowPromoPos = src.indexOf('allow_promotion_codes:', discountsPos)
    assert.ok(
      xorStartPos >= 0,
      '...(stripeCouponId spread must be present for XOR promo logic',
    )
    assert.ok(
      discountsPos > xorStartPos,
      'discounts: must appear inside the stripeCouponId ternary branch',
    )
    assert.ok(
      allowPromoPos > discountsPos,
      'allow_promotion_codes: must appear as the alternate branch after discounts:',
    )
  })
})
