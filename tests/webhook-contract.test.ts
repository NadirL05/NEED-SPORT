import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const src = readFileSync(join(ROOT, 'app/api/webhooks/stripe/route.ts'), 'utf8')

describe('[webhook] source-code contracts', () => {
  // ── Signature guards ──────────────────────────────────────────────────────

  it('[webhook] guard: stripe-signature header is checked before constructEvent', () => {
    const sigGuardPos = src.indexOf('if (!sig)')
    const constructEventPos = src.indexOf('constructEvent(')
    assert.ok(sigGuardPos >= 0, '!sig guard must be present in source')
    assert.ok(constructEventPos >= 0, 'constructEvent must be present in source')
    assert.ok(
      sigGuardPos < constructEventPos,
      'stripe-signature guard must appear before constructEvent in source order',
    )
  })

  it('[webhook] guard: webhook secret is validated before constructEvent', () => {
    const secretGuardPos = src.indexOf('if (!webhookSecret)')
    const constructEventPos = src.indexOf('constructEvent(')
    assert.ok(secretGuardPos >= 0, '!webhookSecret guard must be present in source')
    assert.ok(
      secretGuardPos < constructEventPos,
      'webhookSecret guard must appear before constructEvent in source order',
    )
  })

  it('[webhook] guard: constructEvent is called with (body, sig, webhookSecret) for cryptographic verification', () => {
    assert.match(
      src,
      /constructEvent\(body, sig, webhookSecret\)/,
      'constructEvent must receive body, sig, and webhookSecret — never skip signature check',
    )
  })

  // ── Idempotency ───────────────────────────────────────────────────────────

  it('[webhook] idempotence: getOrderBySession is checked before db.insert to skip already-processed sessions', () => {
    const getOrderPos = src.indexOf('getOrderBySession(')
    const dbInsertPos = src.indexOf('db.insert(')
    assert.ok(getOrderPos >= 0, 'getOrderBySession must be present')
    assert.ok(dbInsertPos >= 0, 'db.insert must be present')
    assert.ok(
      getOrderPos < dbInsertPos,
      'getOrderBySession idempotency check must precede db.insert in source order',
    )
  })

  it('[webhook] idempotence: onConflictDoNothing provides SQL-level deduplication', () => {
    assert.match(
      src,
      /\.onConflictDoNothing\(\)/,
      'onConflictDoNothing must be chained on the orders insert for SQL-level idempotency',
    )
  })

  // ── DB error handling → 500 for Stripe retry ─────────────────────────────

  it('[webhook] reliability: a catch(dbErr) block wraps the DB inserts', () => {
    assert.match(src, /catch\s*\(dbErr\)/, 'catch (dbErr) block must exist around DB operations')
  })

  it('[webhook] reliability: status 500 is returned inside catch(dbErr) so Stripe retries the webhook', () => {
    const catchDbPos = src.indexOf('catch (dbErr)')
    const status500Pos = src.indexOf('status: 500', catchDbPos)
    assert.ok(catchDbPos >= 0, 'catch (dbErr) block must exist')
    assert.ok(
      status500Pos > catchDbPos,
      'status: 500 must appear inside catch(dbErr), not before it',
    )
  })

  // ── Fire-and-forget emails ────────────────────────────────────────────────

  it('[webhook] fire-and-forget: Promise.all emails are sent after the DB catch block, never inside it', () => {
    const dbRetryMsgPos = src.indexOf('Database error — will retry')
    const promiseAllPos = src.indexOf('Promise.all([')
    assert.ok(dbRetryMsgPos >= 0, '"Database error — will retry" message must be present in catch(dbErr)')
    assert.ok(
      promiseAllPos > dbRetryMsgPos,
      'Promise.all email dispatch must appear after the DB catch block closes, not inside it',
    )
  })

  it('[webhook] fire-and-forget: Promise.all has .catch() attached so email failures never block the response', () => {
    assert.match(
      src,
      /Promise\.all\(\[[\s\S]*?\]\)\.catch\(/,
      'Promise.all([...]).catch( must be chained immediately — no unhandled rejection on email failure',
    )
  })
})
