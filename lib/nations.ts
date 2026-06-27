import { list } from '@vercel/blob'
import { unstable_cache } from 'next/cache'

export const getNationImages = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const { blobs } = await list({ prefix: 'nations/' })
      const images: Record<string, string> = {}
      for (const b of blobs) {
        const match = b.pathname.match(/^nations\/([a-z]+)/)
        if (match) images[match[1]] = b.url
      }
      return images
    } catch {
      return {}
    }
  },
  ['nation-images'],
  { revalidate: 3600, tags: ['nation-images'] },
)
