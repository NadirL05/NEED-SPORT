import Link from 'next/link'

const NATIONS = [
  { code: 'fr', name: 'France',     flag: '🇫🇷', color: '#002395' },
  { code: 'br', name: 'Brésil',     flag: '🇧🇷', color: '#009c3b' },
  { code: 'ar', name: 'Argentine',  flag: '🇦🇷', color: '#74acdf' },
  { code: 'de', name: 'Allemagne',  flag: '🇩🇪', color: '#2a2a2a' },
  { code: 'es', name: 'Espagne',    flag: '🇪🇸', color: '#c60b1e' },
  { code: 'pt', name: 'Portugal',   flag: '🇵🇹', color: '#1e6f30' },
  { code: 'en', name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#2c2c2c' },
  { code: 'it', name: 'Italie',     flag: '🇮🇹', color: '#003399' },
  { code: 'nl', name: 'Pays-Bas',   flag: '🇳🇱', color: '#ae1c28' },
  { code: 'be', name: 'Belgique',   flag: '🇧🇪', color: '#1a1a1a' },
]

export default function NationsCarousel() {
  return (
    <section className="nations-sec reveal">
      <div className="wrap">
        <div className="nations-head">
          <div className="nations-head-text">
            <p className="nations-kicker">Sélections nationales</p>
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
            <span className="nation-flag" aria-hidden="true">{n.flag}</span>
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
