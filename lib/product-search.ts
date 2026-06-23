export interface SearchableProduct {
  readonly id: string
  readonly club: string
  readonly name: string
  readonly cat: readonly string[]
}

export interface ProductSearchCriteria {
  readonly query: string
  readonly category: string
}

const SEARCH_ALIASES: Readonly<Record<string, readonly string[]>> = {
  home: ['domicile'],
  away: ['extérieur', 'exterieur'],
  third: ['troisième', 'troisieme'],
}

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .trim()
    .replace(/\s+/g, ' ')
}

export function filterProducts<T extends SearchableProduct>(
  products: readonly T[],
  { query, category }: ProductSearchCriteria,
): T[] {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)

  return products.filter((product) => {
    if (category !== 'all' && !product.cat.includes(category)) {
      return false
    }

    if (terms.length === 0) {
      return true
    }

    const searchableText = normalizeSearch(
      [product.id, product.club, product.name].join(' '),
    )
    const localizedAliases = Object.entries(SEARCH_ALIASES).flatMap(
      ([source, aliases]) => searchableText.includes(source) ? aliases : [],
    )
    const indexedText = normalizeSearch(
      [searchableText, ...localizedAliases].join(' '),
    )

    return terms.every((term) => indexedText.includes(term))
  })
}
