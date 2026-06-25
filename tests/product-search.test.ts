import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterProducts, normalizeSearch } from '../lib/product-search'

const PRODUCTS = [
  {
    id: 'psg-home-2026',
    club: 'Paris Saint-Germain',
    name: 'Home 2026',
    cat: ['clubs'],
  },
  {
    id: 'france-home-2026',
    club: 'Équipe de France',
    name: 'Home 2026',
    cat: ['nations'],
  },
  {
    id: 'argentine-copa-edit',
    club: 'Argentine',
    name: 'Copa Edit',
    cat: ['nations', 'limited'],
  },
]

describe('normalizeSearch', () => {
  it('normalise les accents, la casse et les espaces', () => {
    assert.equal(normalizeSearch('  Équipe   NATIONALE  '), 'equipe nationale')
  })
})

describe('filterProducts', () => {
  it('retrouve un produit par identifiant ou acronyme', () => {
    const result = filterProducts(PRODUCTS, { query: 'PSG', category: 'all' })

    assert.deepEqual(result.map((product) => product.id), ['psg-home-2026'])
  })

  it('combine plusieurs termes sans tenir compte des accents', () => {
    const result = filterProducts(PRODUCTS, {
      query: 'france domicile',
      category: 'all',
    })

    assert.deepEqual(result.map((product) => product.id), ['france-home-2026'])
  })

  it('comprend les équivalents français des noms de maillots anglais', () => {
    const result = filterProducts(PRODUCTS, {
      query: 'domicile',
      category: 'all',
    })

    assert.deepEqual(result.map((product) => product.id), [
      'psg-home-2026',
      'france-home-2026',
    ])
  })

  it('combine la recherche et la catégorie', () => {
    const result = filterProducts(PRODUCTS, {
      query: 'argentine',
      category: 'limited',
    })

    assert.deepEqual(result.map((product) => product.id), ['argentine-copa-edit'])
  })

  it('retourne tous les produits pour une recherche vide sans muter la source', () => {
    const snapshot = structuredClone(PRODUCTS)
    const result = filterProducts(PRODUCTS, { query: '   ', category: 'all' })

    assert.deepEqual(result, PRODUCTS)
    assert.deepEqual(PRODUCTS, snapshot)
    assert.notEqual(result, PRODUCTS)
  })

  it('retourne une liste vide quand aucun produit ne correspond', () => {
    const result = filterProducts(PRODUCTS, {
      query: 'introuvable',
      category: 'all',
    })

    assert.deepEqual(result, [])
  })
})
