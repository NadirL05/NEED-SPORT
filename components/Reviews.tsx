const REVIEWS = [
  {
    name: 'Kylian M.',
    location: 'Paris, 75',
    rating: 5,
    text: 'Maillot reçu en 36h, coupe identique à celle portée en match. Impossible de distinguer du maillot officiel vendu en boutique club.',
    product: 'France Home 2026',
    verified: true,
  },
  {
    name: 'Sofiane B.',
    location: 'Lyon, 69',
    rating: 5,
    text: 'J\'avais commandé ailleurs avant et reçu un faux. Là c\'est le vrai article, le badge est cousu, le tissu DryFit est parfait. Plus question de changer.',
    product: 'PSG Home 2026',
    verified: true,
  },
  {
    name: 'Lucas R.',
    location: 'Marseille, 13',
    rating: 5,
    text: 'Livraison ultra rapide, emballage soigné, maillot authentique certifié. Le Real Madrid Away est exactement ce que je cherchais depuis des mois.',
    product: 'Real Madrid Away 2026',
    verified: true,
  },
  {
    name: 'Mehdi C.',
    location: 'Bordeaux, 33',
    rating: 5,
    text: 'Service client réactif, suivi de colis en temps réel. Le maillot Maroc est sublime, mes fils sont ravis. On repassera commande sans hésiter.',
    product: 'Maroc Home 2026',
    verified: true,
  },
  {
    name: 'Thomas D.',
    location: 'Toulouse, 31',
    rating: 5,
    text: 'Édition limitée Inter Milan — j\'ai failli rater ça. Stock épuisé partout sauf ici. Qualité irréprochable, ça vaut chaque centime.',
    product: 'Inter Milan Limited Black',
    verified: true,
  },
  {
    name: 'Amine K.',
    location: 'Nice, 06',
    rating: 5,
    text: 'Le maillot Argentine Copa Edit est une pièce de collection. Tissu premium, finitions impeccables. NEED SPORT est la seule adresse fiable en France.',
    product: 'Argentine Copa Edit',
    verified: true,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="rev-stars" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`rev-star${i < count ? ' rev-star--on' : ''}`}
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 .5l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8 3 9.5l.6-3.2L1.2 4l3.3-.5z" />
        </svg>
      ))}
    </div>
  )
}

export default function Reviews() {
  return (
    <section className="rev-sec">
      <div className="wrap">
        <div className="rev-head reveal">
          <h2 className="rev-title">1 750 supporters satisfaits</h2>
          <div className="rev-aggregate">
            <Stars count={5} />
            <span className="rev-score">4.9 / 5</span>
            <span className="rev-count">— 1 750 avis vérifiés</span>
          </div>
        </div>

        <div className="rev-grid">
          {REVIEWS.map((r, i) => (
            <article
              key={i}
              className="rev-card reveal"
              style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}
            >
              <Stars count={r.rating} />
              <p className="rev-text">{r.text}</p>
              <div className="rev-foot">
                <div className="rev-author">
                  <span className="rev-name">{r.name}</span>
                  <span className="rev-loc">{r.location}</span>
                </div>
                {r.verified && (
                  <span className="rev-badge" aria-label="Achat vérifié">✓ Vérifié</span>
                )}
              </div>
              <p className="rev-product">{r.product}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
