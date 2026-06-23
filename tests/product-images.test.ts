import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getProductImageValidationError,
  parseImgs,
  productRevalidationTargets,
  serializeImgs,
} from '../lib/product-images'

describe('product image persistence', () => {
  it('preserves the order of one to four valid images', () => {
    const images = [
      'https://cdn.example.com/front.webp',
      'https://cdn.example.com/back.webp',
      '/products/detail.png',
      'https://cdn.example.com/fit.avif',
    ]

    const stored = serializeImgs(images)

    assert.deepEqual(parseImgs(stored), images)
    assert.equal(getProductImageValidationError(stored), null)
  })

  it('rejects an empty image list', () => {
    assert.match(getProductImageValidationError('') ?? '', /au moins une/i)
  })

  it('rejects more than four images instead of silently losing one', () => {
    const stored = JSON.stringify(
      Array.from({ length: 5 }, (_, index) => `https://cdn.example.com/${index}.webp`),
    )

    assert.match(getProductImageValidationError(stored) ?? '', /4 photos maximum/i)
  })

  it('rejects malformed, unsafe, and duplicate image references', () => {
    assert.match(getProductImageValidationError('[not-json') ?? '', /format/i)
    assert.match(
      getProductImageValidationError(JSON.stringify(['https://cdn.example.com/front.webp', 42])) ?? '',
      /format/i,
    )
    assert.match(getProductImageValidationError('javascript:alert(1)') ?? '', /URL/i)
    assert.match(
      getProductImageValidationError(JSON.stringify([
        'https://cdn.example.com/front.webp',
        'https://cdn.example.com/front.webp',
      ])) ?? '',
      /doublon/i,
    )
  })
})

describe('product cache invalidation', () => {
  it('returns every storefront affected by a product mutation', () => {
    assert.deepEqual(productRevalidationTargets('psg/home 2026'), [
      { path: '/' },
      { path: '/shop' },
      { path: '/collections/[cat]', type: 'page' },
      { path: '/products/psg%2Fhome%202026' },
      { path: '/admin/products' },
    ])
  })
})
