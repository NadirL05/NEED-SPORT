import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_URL ?? 'https://need-sport.fr'
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/checkout/'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
