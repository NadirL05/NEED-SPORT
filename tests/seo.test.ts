import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Product } from '../lib/db/schema'
import {
  absoluteUrl,
  breadcrumbLd,
  organizationLd,
  productLd,
  SITE_NAME,
  SITE_URL,
  websiteLd,
} from '../lib/seo'

const product = {
  id: 'france-away-2026',
  supplierId: null,
  club: 'France',
  name: 'Extérieur 2026',
  priceEur: 8_990,
  compareAtPriceEur: null,
  cat: ['nations'],
  img: JSON.stringify(['/products/france-front.webp', '/products/france-back.webp']),
  stock: 0,
  active: true,
  stripeProductId: null,
  seoTitle: null,
  seoDescription: 'Maillot extérieur France 2026.',
  createdAt: new Date('2026-01-01'),
} satisfies Product

describe('structured-data helpers', () => {
  it('normalizes local assets while preserving absolute HTTP URLs', () => {
    assert.equal(absoluteUrl(), undefined)
    assert.equal(absoluteUrl('/products/front.webp'), `${SITE_URL}/products/front.webp`)
    assert.equal(absoluteUrl('products/front.webp'), `${SITE_URL}/products/front.webp`)
    assert.equal(absoluteUrl('https://cdn.example.com/front.webp'), 'https://cdn.example.com/front.webp')
  })

  it('describes the organization and searchable website consistently', () => {
    const organization = organizationLd()
    const website = websiteLd()

    assert.equal(organization.name, SITE_NAME)
    assert.equal(organization.logo, `${SITE_URL}/icon.svg`)
    assert.equal(website.name, SITE_NAME)
    assert.equal(website.potentialAction.target, `${SITE_URL}/shop?q={search_term_string}`)
  })

  it('publishes stock, custom copy, image, and administered price for a product', () => {
    const data = productLd(product)

    assert.equal(data.image, `${SITE_URL}/products/france-front.webp`)
    assert.equal(data.description, product.seoDescription)
    assert.equal(data.offers.price, '89.90')
    assert.equal(data.offers.availability, 'https://schema.org/OutOfStock')
  })

  it('numbers breadcrumb items and makes their paths absolute', () => {
    const data = breadcrumbLd([
      { name: 'Accueil', path: '/' },
      { name: 'Nations', path: '/collections/nations' },
    ])

    assert.deepEqual(data.itemListElement.map(({ position, item }) => ({ position, item })), [
      { position: 1, item: `${SITE_URL}/` },
      { position: 2, item: `${SITE_URL}/collections/nations` },
    ])
  })
})
