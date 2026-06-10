const REVIEWS = [
  {
    name: 'Lucas M.',
    location: 'Lyon',
    age: 27,
    stars: 5,
    quote: 'Maillot reçu en 24h, qualité authentique impeccable. Le floquage est parfait, exactement comme au stade.',
    product: 'Paris Home 2026',
  },
  {
    name: 'Sarah B.',
    location: 'Paris',
    age: 31,
    stars: 5,
    quote: 'Mon troisième achat chez MAILLO. Jamais déçu. Tissu premium, coupe fidèle, livraison toujours rapide.',
    product: 'Real Madrid 2026',
  },
  {
    name: 'Karim D.',
    location: 'Marseille',
    age: 24,
    stars: 5,
    quote: "L'édition limitée vaut chaque euro. Emballage soigné, certificat d'authenticité inclus. Top.",
    product: 'Édition Nuit',
  },
  {
    name: 'Émilie R.',
    location: 'Bordeaux',
    age: 29,
    stars: 5,
    quote: "Service client réactif, j'ai changé de taille sans aucun frais. Le maillot France est magnifique.",
    product: 'France Home 2026',
  },
  {
    name: 'Thomas V.',
    location: 'Lille',
    age: 35,
    stars: 5,
    quote: "Authentique à 100%, rien à voir avec les contrefaçons. Je recommande les yeux fermés.",
    product: 'Liverpool 2026',
  },
  {
    name: 'Nadia K.',
    location: 'Toulouse',
    age: 22,
    stars: 4,
    quote: 'Très belle qualité, livraison dans les temps. Un point en moins car ma taille était presque épuisée.',
    product: 'Inter Milan 2026',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span className="rev-stars" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`rev-star${i < count ? ' rev-star--on' : ''}`} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

export default function Reviews() {
  return (
    <section className="rev-sec">
      <div className="rev-head reveal">
        <h2 className="rev-count display">1 750 supporters satisfaits</h2>
        <div className="rev-aggregate">
          <Stars count={5} />
          <span className="rev-score">4.9/5 — 1 750 avis vérifiés</span>
        </div>
      </div>

      <div className="rev-grid wrap">
        {REVIEWS.map((r, i) => (
          <article
            key={i}
            className="rev-card reveal"
            style={{ '--reveal-delay': `${i * 55}ms` } as React.CSSProperties}
          >
            <Stars count={r.stars} />
            <blockquote className="rev-quote">
              «&nbsp;{r.quote}&nbsp;»
            </blockquote>
            <div className="rev-author">
              <span className="rev-author-name">{r.name}</span>
              <span className="rev-author-loc">{r.location} · {r.age} ans</span>
            </div>
            <hr className="rev-divider" />
            <div className="rev-card-foot">
              <span className="rev-verified">✓ Vérifié</span>
              <span className="rev-tag">{r.product}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
