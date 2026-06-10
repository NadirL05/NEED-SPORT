import Link from 'next/link'

interface TileProps {
  href: string
  num: string
  category: string
  label: string
  tint: string
}

function Tile({ href, num, category, label, tint }: TileProps) {
  return (
    <Link
      href={href}
      className="ed-tile reveal"
      style={{ '--ed-tint': tint } as React.CSSProperties}
    >
      <span className="ed-tile-num" aria-hidden="true">{num}</span>
      <div className="ed-tile-body">
        <p className="ed-tile-cat">{category}</p>
        <h2 className="ed-tile-label">{label}</h2>
        <span className="btn btn--ghost ed-tile-btn">Voir la collection →</span>
      </div>
    </Link>
  )
}

export default function EditorialTiles() {
  return (
    <section className="ed-sec">
      <div className="ed-grid">
        <Tile href="/collections/clubs"   num="01" category="Clubs"   label="Les Grands Clubs" tint="#cdd4e3" />
        <Tile href="/collections/nations" num="02" category="Nations" label="Les Sélections"   tint="#e5d5dc" />
      </div>
    </section>
  )
}
