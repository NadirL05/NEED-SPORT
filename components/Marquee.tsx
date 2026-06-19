const ITEMS = [
  'Paiement sécurisé',
  'Maillots officiels',
  'Livraison 48–72h',
  'Certifié FIFA',
  'Authentique garanti',
  'Retours gratuits',
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
