import Link from 'next/link'
import Image from 'next/image'
import { list } from '@vercel/blob'
import NationsFilter from './NationsFilter'

type Continent = 'europe' | 'amerique' | 'afrique' | 'asie'

export const NATIONS: { code: string; name: string; color: string; continent: Continent }[] = [
  { code: 'fr', name: 'France',     color: '#002395', continent: 'europe' },
  { code: 'de', name: 'Allemagne',  color: '#2a2a2a', continent: 'europe' },
  { code: 'es', name: 'Espagne',    color: '#c60b1e', continent: 'europe' },
  { code: 'pt', name: 'Portugal',   color: '#1e6f30', continent: 'europe' },
  { code: 'en', name: 'Angleterre', color: '#2c2c2c', continent: 'europe' },
  { code: 'it', name: 'Italie',     color: '#003399', continent: 'europe' },
  { code: 'nl', name: 'Pays-Bas',   color: '#ae1c28', continent: 'europe' },
  { code: 'be', name: 'Belgique',   color: '#1a1a1a', continent: 'europe' },
  { code: 'br', name: 'Brésil',     color: '#009c3b', continent: 'amerique' },
  { code: 'ar', name: 'Argentine',  color: '#74acdf', continent: 'amerique' },
  { code: 'mx', name: 'Mexique',    color: '#006847', continent: 'amerique' },
  { code: 'sn', name: 'Sénégal',    color: '#00853F', continent: 'afrique' },
  { code: 'ma', name: 'Maroc',      color: '#C1272D', continent: 'afrique' },
  { code: 'ng', name: 'Nigeria',    color: '#008751', continent: 'afrique' },
  { code: 'jp', name: 'Japon',      color: '#BC002D', continent: 'asie' },
  { code: 'kr', name: 'Corée',      color: '#003478', continent: 'asie' },
]

async function getNationImages(): Promise<Record<string, string>> {
  try {
    const { blobs } = await list({ prefix: 'nations/' })
    const images: Record<string, string> = {}
    for (const b of blobs) {
      const code = b.pathname.replace('nations/', '').replace(/\.[^.]+$/, '')
      images[code] = b.url
    }
    return images
  } catch {
    return {}
  }
}

export default async function NationsCarousel() {
  const images = await getNationImages()

  const nations = NATIONS.map((n) => ({ ...n, img: images[n.code] ?? null }))

  return (
    <section className="nations-sec reveal">
      <div className="wrap">
        <div className="nations-head">
          <div className="nations-head-text">
            <h2 className="nations-title display">Les Nations</h2>
          </div>
        </div>
      </div>

      <NationsFilter nations={nations} />

      <div className="wrap">
        <div className="nations-cta">
          <Link href="/collections/nations" className="btn btn--ghost nations-btn">
            Découvrez notre sélection pour les équipes nationales →
          </Link>
        </div>
      </div>
    </section>
  )
}
