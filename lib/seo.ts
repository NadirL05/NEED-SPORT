import type { Product } from './db/schema'
import { FROM_PRICE_CENTS, VINTAGE_PRICE_CENTS, isVintageCat } from './pricing'

/** Canonical site origin (override with NEXT_PUBLIC_SITE_URL in prod). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_URL ??
  'https://needsport.fr'
).replace(/\/+$/, '')

export const SITE_NAME = 'NEEDSPORT.'

export const SOCIALS = [
  'https://www.instagram.com/needsport.fr',
  'https://www.tiktok.com/@needsport.fr',
]

/** Make a possibly-relative asset path absolute for structured data / OG. */
export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: SOCIALS,
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productLd(product: Product) {
  const fromCents = isVintageCat(product.cat) ? VINTAGE_PRICE_CENTS : FROM_PRICE_CENTS
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.club} ${product.name}`,
    image: absoluteUrl(product.img),
    description:
      product.seoDescription ??
      `Maillot officiel ${product.name} de ${product.club}. Flocage, patchs et livraison suivie 10–15 jours.`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: 'Maillot de football',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (fromCents / 100).toFixed(2),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.id}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}
