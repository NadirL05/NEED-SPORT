import Image from 'next/image'

// Temp grid — remplacer par les vraies photos de l'équipe (Ghaith)
const SLOTS = [
  { src: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80', alt: 'Supporter maillot' },
  { src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', alt: 'Ambiance stade' },
  { src: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=600&q=80', alt: 'Joueur maillot' },
  { src: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80', alt: 'Football action' },
  { src: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=600&q=80', alt: 'Maillot détail' },
  { src: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80', alt: 'Supporter stade' },
]

export default function UGCSection() {
  return (
    <section className="ugc-sec">
      <div className="wrap">
        <div className="ugc-head reveal">
          <h2 className="ugc-title">ILS LE PORTENT</h2>
          <p className="ugc-sub">
            Rejoins la famille. Tague <strong>@needsport.fr</strong> pour apparaître ici.
          </p>
        </div>
      </div>

      <div className="ugc-grid">
        {SLOTS.map((slot, i) => (
          <div key={i} className="ugc-cell reveal" style={{ '--reveal-delay': `${i * 50}ms` } as React.CSSProperties}>
            <Image
              src={slot.src}
              alt={slot.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
            <div className="ugc-overlay" aria-hidden="true">
              <svg className="ugc-ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="wrap">
        <div className="ugc-cta reveal">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            Suivre @needsport.fr →
          </a>
        </div>
      </div>
    </section>
  )
}
