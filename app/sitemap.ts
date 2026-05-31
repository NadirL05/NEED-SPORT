import type { MetadataRoute } from 'next'
import { CATALOG } from '@/lib/catalog'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_URL ?? 'https://need-sport.fr'

  const products = CATALOG.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/cart`, lastModified: new Date(), changeFrequency: 'never', priority: 0.2 },
    ...products,
  ]
}
