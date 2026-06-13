import Image from 'next/image'
import Link from 'next/link'

interface TileProps {
  href: string
  src: string
  category: string
  label: string
}

function Tile({ href, src, category, label }: TileProps) {
  return (
    <Link href={href} className="editorial-tile">
      <div className="editorial-tile-img">
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="editorial-tile-overlay" />
      <div className="editorial-tile-content">
        <p className="editorial-tile-category">{category}</p>
        <h2 className="editorial-tile-label">{label}</h2>
        <span className="btn btn--ghost">Voir la collection →</span>
      </div>
    </Link>
  )
}

export default function EditorialTiles() {
  return (
    <section className="editorial-sec">
      <div className="editorial-grid">
        <Tile
          href="/collections/clubs"
          src="/editorial-clubs.jpg"
          category="Clubs"
          label="Les Grands Clubs"
        />
        <Tile
          href="/collections/nations"
          src="/editorial-nations.jpg"
          category="Nations"
          label="Les Sélections"
        />
      </div>
    </section>
  )
}
