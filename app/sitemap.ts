import type { MetadataRoute } from 'next'
import { getProducts, getPublishedPages } from '@/lib/db/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_URL ?? 'https://maillo.fr'
  const [products, pages] = await Promise.all([getProducts(), getPublishedPages()])

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: p.createdAt ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const pageUrls: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${base}/p/${p.id}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/collections/clubs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/collections/nations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/collections/limited`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/collections/vintage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...productUrls,
    ...pageUrls,
  ]
}
