import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Product } from '../lib/db/schema'
import {
  basePriceCents,
  DEFAULT_OPTIONS,
  EMBALLAGE_CENTS,
  FLOCAGE_CENTS,
  formatEur,
  isVintageCat,
  normalizeOptions,
  optionsKey,
  optionsSummary,
  PATCH_CENTS,
  PLAYER_SURCHARGE_CENTS,
  SET_SURCHARGE_CENTS,
  SHORT_TSHIRT_SURCHARGE_CENTS,
  type ProductOptions,
  unitPriceCents,
} from '../lib/pricing'
import { productLd } from '../lib/seo'

const PRODUCT_BASE_PRICE = 14_990

describe('catalog-driven pricing', () => {
  it('uses the administered product price as the default unit price', () => {
    assert.equal(unitPriceCents(PRODUCT_BASE_PRICE, DEFAULT_OPTIONS), PRODUCT_BASE_PRICE)
  })

  it('adds deterministic configuration supplements to the product base price', () => {
    const configured = unitPriceCents(PRODUCT_BASE_PRICE, {
      version: 'player',
      kit: 'set',
      flocage: true,
      patch: 'ldc',
      emballage: true,
    })

    assert.equal(
      configured,
      PRODUCT_BASE_PRICE
        + PLAYER_SURCHARGE_CENTS
        + SET_SURCHARGE_CENTS
        + FLOCAGE_CENTS
        + PATCH_CENTS
        + EMBALLAGE_CENTS,
    )
  })

  it('uses a deterministic short+t-shirt supplement and ignores the hidden version choice', () => {
    assert.equal(
      unitPriceCents(PRODUCT_BASE_PRICE, {
        ...DEFAULT_OPTIONS,
        version: 'player',
        kit: 'short_tshirt',
      }),
      PRODUCT_BASE_PRICE + SHORT_TSHIRT_SURCHARGE_CENTS,
    )
  })

  it('keeps vintage at the administered base while retaining selected add-ons', () => {
    assert.equal(
      unitPriceCents(PRODUCT_BASE_PRICE, {
        ...DEFAULT_OPTIONS,
        version: 'player',
        kit: 'set',
        patch: 'cdm',
      }, true),
      PRODUCT_BASE_PRICE + PATCH_CENTS,
    )
  })

  it('normalizes untrusted configuration values without accepting unknown variants', () => {
    assert.deepEqual(normalizeOptions(null), DEFAULT_OPTIONS)
    assert.deepEqual(normalizeOptions({
      version: 'player',
      kit: 'set',
      patch: 'ligue',
      flocage: true,
      emballage: true,
    }), {
      version: 'player',
      kit: 'set',
      patch: 'ligue',
      flocage: true,
      emballage: true,
    })
    assert.deepEqual(normalizeOptions({
      version: 'academy',
      kit: 'tracksuit',
      patch: 'unknown',
      flocage: 1,
      emballage: 0,
    } as unknown as Partial<ProductOptions>), {
      ...DEFAULT_OPTIONS,
      flocage: true,
    })
  })

  it('rejects invalid cent amounts at the pricing boundary', () => {
    assert.throws(() => basePriceCents(0, DEFAULT_OPTIONS), RangeError)
    assert.throws(() => basePriceCents(24.99, DEFAULT_OPTIONS), RangeError)
  })

  it('builds stable line identities and human-readable option summaries', () => {
    const configured: ProductOptions = {
      version: 'player',
      kit: 'set',
      flocage: true,
      patch: 'ldc',
      emballage: true,
    }

    assert.equal(optionsKey(configured), 'player-set-f1-ldc-e1')
    assert.equal(
      optionsSummary(configured),
      'Player · Ensemble · Flocage · Patch Ligue des Champions · Emballage cadeau',
    )
    assert.equal(optionsSummary({ ...DEFAULT_OPTIONS, kit: 'short_tshirt' }), 'Short + t-shirt')
    assert.equal(optionsSummary(DEFAULT_OPTIONS, true), 'Vintage')
  })

  it('detects vintage categories and formats cents in French euros', () => {
    assert.equal(isVintageCat(['clubs', 'vintage']), true)
    assert.equal(isVintageCat(null), false)
    assert.match(formatEur(14_990), /149,90\s€/)
  })

  it('publishes the same administered base price in product structured data', () => {
    const product = {
      id: 'psg-home-2026',
      supplierId: null,
      club: 'Paris Saint-Germain',
      name: 'Domicile 2026',
      priceEur: PRODUCT_BASE_PRICE,
      compareAtPriceEur: null,
      cat: ['clubs'],
      img: '/products/psg.webp',
      stock: 4,
      active: true,
      seoTitle: null,
      seoDescription: null,
      createdAt: new Date('2026-01-01'),
    } satisfies Product

    const ld = productLd(product)

    assert.equal(ld.offers.price, '149.90')
  })
})
