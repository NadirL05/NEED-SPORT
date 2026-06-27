import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, describe, it } from 'node:test'
import { resolve } from 'node:path'

// ─────────────────────────────────────────────────────────────────────────────
// Helper – same pattern as storefront-contract.test.ts
// ─────────────────────────────────────────────────────────────────────────────
const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

// ─────────────────────────────────────────────────────────────────────────────
// 1. Source-code contracts (no DB needed at all)
//
//    These assert the structural shape of the module: fire-and-forget pattern,
//    error swallowing, and data-mapping decisions. They are stable against any
//    DB provider swap and require zero test infrastructure.
// ─────────────────────────────────────────────────────────────────────────────
describe('admin-audit — source-code contracts', () => {
  it('exports auditAdminAction as a plain (non-async) function so callers never need to await it', () => {
    const code = source('lib/admin-audit.ts')

    assert.match(
      code,
      /export function auditAdminAction/,
      'auditAdminAction must be a named export',
    )
    assert.doesNotMatch(
      code,
      /export async function auditAdminAction/,
      'auditAdminAction must NOT be async — the call site must stay fire-and-forget',
    )
  })

  it('attaches .catch() to the DB call so no unhandled Promise rejection escapes', () => {
    const code = source('lib/admin-audit.ts')

    assert.match(
      code,
      /\.catch\(\s*err\s*=>/,
      '.catch(err => …) must be present immediately after the insert chain',
    )
    // Safety: no bare "await db.insert" that would block or expose rejection
    assert.doesNotMatch(
      code,
      /await\s+db\.insert/,
      'the DB call must never be awaited — fire-and-forget only',
    )
  })

  it('stringifies a non-null resourceId and falls back a missing summary to null', () => {
    const code = source('lib/admin-audit.ts')

    assert.match(
      code,
      /String\(params\.resourceId\)/,
      'resourceId must be cast to string before insertion',
    )
    assert.match(
      code,
      /params\.summary\s*\?\?\s*null/,
      'summary must default to null when the caller omits it',
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Behavioral contracts (lazy DB proxy, no real connection)
//
//    The DB proxy (lib/db/index.ts) throws synchronously when DATABASE_URL is
//    absent, before .catch() is reached. Setting a fake URL lets the proxy
//    create a Neon HTTP client (no network call at construction) so the actual
//    insert attempt becomes an async rejection — caught by .catch() — while
//    auditAdminAction returns void synchronously as designed.
//
//    This is NOT a DB mock: no DB module is replaced; the real lazy proxy runs.
//    The only reason for the fake URL is to cross the Proxy guard.
// ─────────────────────────────────────────────────────────────────────────────
describe('admin-audit — behavioral contracts (fake DATABASE_URL, no real DB)', () => {
  let savedUrl: string | undefined

  before(() => {
    savedUrl = process.env.DATABASE_URL
    // Any syntactically valid Postgres URL works: Neon validates it only on
    // the first actual HTTP request, not at client construction.
    process.env.DATABASE_URL = 'postgresql://fake:fake@fake.invalid/fake'
  })

  after(() => {
    process.env.DATABASE_URL = savedUrl
  })

  it('returns undefined synchronously — the call site never receives a Promise to await', async () => {
    const { auditAdminAction } = await import('../lib/admin-audit')

    const result = auditAdminAction({ action: 'create', resource: 'product', resourceId: 42 })

    assert.equal(result, undefined)
    assert.ok(!(result instanceof Promise), 'return value must not be a Promise')
  })

  it('does not throw synchronously when optional fields are omitted', async () => {
    const { auditAdminAction } = await import('../lib/admin-audit')

    assert.doesNotThrow(() => {
      auditAdminAction({ action: 'delete', resource: 'order' })
    })
  })

  it('does not throw synchronously when resourceId is explicitly null', async () => {
    const { auditAdminAction } = await import('../lib/admin-audit')

    assert.doesNotThrow(() => {
      auditAdminAction({
        action: 'update',
        resource: 'config',
        resourceId: null,
        summary: 'prix mis à jour',
      })
    })
  })
})
