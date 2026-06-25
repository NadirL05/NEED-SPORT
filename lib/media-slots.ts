import { list } from '@vercel/blob'
import { unstable_cache } from 'next/cache'

export type MediaSlot = {
  key: string
  label: string
  description: string
  fallback: string
  section: string
}

/**
 * Every non-product/nation image rendered by the public site should live here.
 *
 * The admin UI uploads replacements to Blob under `media-slots/{key}.{ext}`.
 * Components receive the resolved URL and fall back to the static asset until a
 * custom image is uploaded. This keeps the site fully customisable without a DB
 * migration and avoids storing large files in Postgres.
 */
export const MEDIA_SLOTS = [
  {
    key: 'home.hero',
    label: 'Accueil — Hero principal',
    description: 'Grande image en haut de la page d’accueil.',
    fallback: '/hero-benzema-2.jpg',
    section: 'Accueil',
  },
  {
    key: 'home.immersive',
    label: 'Accueil — Bloc immersif France 2026',
    description: 'Image pleine largeur du bloc “Drop exclusif”.',
    fallback: '/hero-dark.jpg',
    section: 'Accueil',
  },
  {
    key: 'home.editorial.clubs',
    label: 'Accueil — Tuile éditoriale Clubs',
    description: 'Image de la carte “Les Grands Clubs”.',
    fallback: '/editorial-clubs.jpg',
    section: 'Accueil',
  },
  {
    key: 'home.editorial.nations',
    label: 'Accueil — Tuile éditoriale Nations',
    description: 'Image de la carte “Les Sélections”.',
    fallback: '/editorial-nations.jpg',
    section: 'Accueil',
  },
  {
    key: 'home.ugc.1',
    label: 'UGC — Photo 1',
    description: 'Première image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
  {
    key: 'home.ugc.2',
    label: 'UGC — Photo 2',
    description: 'Deuxième image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
  {
    key: 'home.ugc.3',
    label: 'UGC — Photo 3',
    description: 'Troisième image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
  {
    key: 'home.ugc.4',
    label: 'UGC — Photo 4',
    description: 'Quatrième image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
  {
    key: 'home.ugc.5',
    label: 'UGC — Photo 5',
    description: 'Cinquième image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
  {
    key: 'home.ugc.6',
    label: 'UGC — Photo 6',
    description: 'Sixième image de la grille “Ils le portent”.',
    fallback: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80',
    section: 'UGC / Instagram',
  },
] as const satisfies readonly MediaSlot[]

export type MediaSlotKey = (typeof MEDIA_SLOTS)[number]['key']

export const MEDIA_SLOT_KEYS = new Set<string>(MEDIA_SLOTS.map((s) => s.key))

export function mediaSlotPathPrefix(key: string): string {
  return `media-slots/${key}.`
}

export function mediaSlotPath(key: string, ext: string): string {
  return `media-slots/${key}.${ext}`
}

const fetchMediaSlotImages = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const { blobs } = await list({ prefix: 'media-slots/' })
      const images: Record<string, string> = {}
      for (const b of blobs) {
        const file = b.pathname.replace('media-slots/', '')
        const key = file.replace(/\.[^.]+$/, '')
        if (MEDIA_SLOT_KEYS.has(key)) images[key] = b.url
      }
      return images
    } catch {
      return {}
    }
  },
  ['media-slot-images'],
  { tags: ['media-slots'], revalidate: 3600 },
)

export async function getMediaSlotImages(): Promise<Record<string, string>> {
  return fetchMediaSlotImages()
}

export async function resolveMediaSlots(): Promise<Record<MediaSlotKey, string>> {
  const uploaded = await getMediaSlotImages()
  return Object.fromEntries(
    MEDIA_SLOTS.map((slot) => [slot.key, uploaded[slot.key] ?? slot.fallback]),
  ) as Record<MediaSlotKey, string>
}
