import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { resolve } from 'node:path'

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('storefront acceptance contracts', () => {
  it('uses the administered product price on active catalog cards', () => {
    for (const path of [
      'components/ProductRail.tsx',
      'components/ShopSection.tsx',
      'app/collections/[cat]/CollectionClient.tsx',
    ]) {
      const code = source(path)
      assert.match(code, /product\.priceEur/, `${path} must render product.priceEur`)
      assert.doesNotMatch(code, /FROM_PRICE_CENTS/, `${path} must not render a catalog-wide price`)
    }
  })

  it('keeps the requested product-page sections in strict source order', () => {
    const code = source('app/products/[id]/ProductClient.tsx')
    const markers = [
      'className="product-name"',
      'className="product-price-row"',
      'className="product-gallery"',
      'className="product-options"',
      'className="product-characteristics"',
    ]
    const positions = markers.map((marker) => code.indexOf(marker))

    assert.ok(positions.every((position) => position >= 0), 'every requested section must exist')
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b))
    assert.match(code, /parseImgs\(product\.img\)\.slice\(0, 4\)/)
  })

  it('keeps the exact homepage copy, category switch, dynamic links, and CTA', () => {
    const hero = source('components/Hero.tsx')
    const rail = source('components/ProductRail.tsx')

    assert.match(hero, />Explorez nos maillots</)
    assert.match(hero, />Offrez-vous l’excellence</)
    assert.match(rail, />\s*Commander\s*</)
    assert.match(rail, /'Clubs' : 'Nations'/)
    assert.match(rail, /`\/collections\/\$\{activeCategory\}`/)
    assert.match(rail, />Voir tout →</)
  })

  it('exposes a per-image replacement control in the admin editor', () => {
    const code = source('app/admin/(secure)/products/ProductForm.tsx')

    assert.match(code, /const replaceImg = async/)
    assert.match(code, /onChange=\{\(event\) => void replaceImg\(idx, event\.currentTarget\)\}/)
  })

  it('exposes configurator toggle state to assistive technology', () => {
    const code = source('app/products/[id]/ProductClient.tsx')
    const pressedStates = code.match(/aria-pressed=/g) ?? []

    assert.ok(pressedStates.length >= 8, 'every visual product toggle must expose aria-pressed')
  })
})
