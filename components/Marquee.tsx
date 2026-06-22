const ITEMS = [
  'Paiement sécurisé',
  'Maillots officiels',
  'Livraison 10–15 jours',
  'Certifié FIFA',
  'Authentique garanti',
  'Retours 14 jours',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS, ...ITEMS]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="m-item">
            {item} <i className="m-dot">·</i>
          </span>
        ))}
      </div>
    </div>
  )
}
