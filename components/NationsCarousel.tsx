import Link from 'next/link'
import Image from 'next/image'
import { list } from '@vercel/blob'

const NATIONS = [
  { code: 'fr', name: 'France',     color: '#002395' },
  { code: 'br', name: 'Brésil',     color: '#009c3b' },
  { code: 'ar', name: 'Argentine',  color: '#74acdf' },
  { code: 'de', name: 'Allemagne',  color: '#2a2a2a' },
  { code: 'es', name: 'Espagne',    color: '#c60b1e' },
  { code: 'pt', name: 'Portugal',   color: '#1e6f30' },
  { code: 'en', name: 'Angleterre', color: '#2c2c2c' },
  { code: 'it', name: 'Italie',     color: '#003399' },
  { code: 'nl', name: 'Pays-Bas',   color: '#ae1c28' },
  { code: 'be', name: 'Belgique',   color: '#1a1a1a' },
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

  return (
    <section className="nations-sec reveal">
      <div className="wrap">
        <div className="nations-head">
          <div className="nations-head-text">
            <h2 className="nations-title display">Les Nations</h2>
          </div>
        </div>
      </div>

      <div className="nations-scroll" role="list" aria-label="Équipes nationales">
        {NATIONS.map((n) => (
          <Link
            key={n.code}
            href="/collections/nations"
            className="nation-card reveal"
            role="listitem"
            style={{ '--nation-color': n.color } as React.CSSProperties}
          >
            <div className="nation-img-wrap">
              {images[n.code] ? (
                <Image
                  src={images[n.code]}
                  alt={n.name}
                  fill
                  sizes="190px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="nation-img-placeholder" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span>Ajouter une image</span>
                </div>
              )}
            </div>
            <span className="nation-name">{n.name}</span>
          </Link>
        ))}
      </div>

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
