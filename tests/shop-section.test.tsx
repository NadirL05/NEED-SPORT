import assert from 'node:assert/strict'
import { afterEach, before, describe, it } from 'node:test'
import { Window } from 'happy-dom'
import type { Product } from '../lib/db/schema'

const happyWindow = new Window({ url: 'http://localhost/shop' })
happyWindow.document.head.innerHTML = [
  '<style>',
  '.ms2-card{position:relative;height:300px}',
  '.ms2-card-link{position:relative;display:block;height:300px}',
  '</style>',
].join('')

for (const [key, value] of Object.entries({
  document: happyWindow.document,
  HTMLElement: happyWindow.HTMLElement,
  HTMLInputElement: happyWindow.HTMLInputElement,
  navigator: happyWindow.navigator,
  Node: happyWindow.Node,
  self: happyWindow,
  window: happyWindow,
  Event: happyWindow.Event,
  MouseEvent: happyWindow.MouseEvent,
  MutationObserver: happyWindow.MutationObserver,
  getComputedStyle: happyWindow.getComputedStyle.bind(happyWindow),
})) {
  Object.defineProperty(globalThis, key, { configurable: true, value })
}

const reactGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean
}
reactGlobal.IS_REACT_ACT_ENVIRONMENT = true

let cleanup: typeof import('@testing-library/react').cleanup = () => undefined
let render: typeof import('@testing-library/react').render
let screen: typeof import('@testing-library/react').screen
let within: typeof import('@testing-library/react').within
let userEvent: typeof import('@testing-library/user-event').default
let ShopSection: typeof import('../components/ShopSection').default

before(async () => {
  const testingLibrary = await import('@testing-library/react')
  cleanup = testingLibrary.cleanup
  render = testingLibrary.render
  screen = testingLibrary.screen
  within = testingLibrary.within
  userEvent = (await import('@testing-library/user-event')).default
  ShopSection = (await import('../components/ShopSection')).default
})

const PRODUCTS: Product[] = [
  {
    id: 'psg-home-2026',
    supplierId: null,
    club: 'Paris Saint-Germain',
    name: 'Home 2026',
    priceEur: 14990,
    compareAtPriceEur: null,
    cat: ['clubs'],
    img: '/psg.jpg',
    stock: 12,
    active: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: null,
  },
  {
    id: 'france-away-2026',
    supplierId: null,
    club: 'Équipe de France',
    name: 'Away 2026',
    priceEur: 15990,
    compareAtPriceEur: null,
    cat: ['nations'],
    img: '/france.jpg',
    stock: 8,
    active: true,
    seoTitle: null,
    seoDescription: null,
    createdAt: null,
  },
]

afterEach(cleanup)

describe('ShopSection', () => {
  it('recherche, combine les filtres et réinitialise sans perdre le focus', async () => {
    const user = userEvent.setup({ document: happyWindow.document as never })
    render(<ShopSection products={PRODUCTS} />)

    const search = screen.getByRole('searchbox', {
      name: 'Rechercher un club ou un maillot',
    })
    const filters = screen.getByRole('group', { name: 'Filtrer par catégorie' })

    assert.equal(screen.getByRole('heading', { level: 1 }).textContent, 'Nos Maillots')
    assert.match(screen.getByRole('status').textContent ?? '', /2 maillots/i)

    await user.type(search, 'domicile')

    assert.match(screen.getByRole('status').textContent ?? '', /1 maillot/i)
    assert.ok(screen.getByText('Paris Saint-Germain'))
    assert.equal(screen.queryByText('Équipe de France'), null)

    await user.click(within(filters).getByRole('button', { name: 'Nations' }))

    assert.ok(screen.getByText('Aucun maillot trouvé'))

    await user.click(screen.getByRole('button', { name: 'Réinitialiser' }))

    assert.equal(happyWindow.document.activeElement, search)
    assert.match(screen.getByRole('status').textContent ?? '', /2 maillots/i)
    assert.equal(
      within(filters).getByRole('button', { name: 'Tous' }).getAttribute('aria-pressed'),
      'true',
    )

    await user.type(search, 'France')
    await user.click(screen.getByRole('button', { name: 'Effacer la recherche' }))

    assert.equal(happyWindow.document.activeElement, search)
    assert.equal((search as HTMLInputElement).value, '')
  })
})
