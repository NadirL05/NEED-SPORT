import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

describe('employee product editor regressions', () => {
  it('enforces the shared image contract and exposes replacement controls', () => {
    const source = read('app/employee/(secure)/products/EmployeeProductForm.tsx')

    assert.match(source, /MAX_PRODUCT_IMAGES/)
    assert.match(source, /getProductImageValidationError/)
    assert.match(source, /replaceImg/)
    assert.match(source, /moveImg/)
    assert.match(source, /role="alert"/)
  })

  it('validates images and revalidates storefronts after employee creation', () => {
    const source = read('app/api/employee/products/route.ts')

    assert.match(source, /getProductImageValidationError/)
    assert.match(source, /productRevalidationTargets/)
    assert.match(source, /revalidatePath/)
  })

  it('validates images and revalidates storefronts after update and deletion', () => {
    const source = read('app/api/employee/products/[id]/route.ts')

    assert.match(source, /getProductImageValidationError/)
    assert.match(source, /productRevalidationTargets/)
    assert.match(source, /revalidatePath/)
    assert.match(source, /returning\(\{ id: products\.id \}\)/)
  })
})
