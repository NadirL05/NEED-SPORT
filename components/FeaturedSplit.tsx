import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db/schema'

interface Props {
  product: Product | null
}

export default function FeaturedSplit({ product }: Props) {
  if (!product) return null

  return (
    <section className="feat-split reveal">
      <div className="feat-media">
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="50vw"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
      <div className="feat-body">
        <p className="feat-kicker">Sélection du moment</p>
        <h2 className="feat-name">{product.name}</h2>
        <p className="feat-club">{product.club}</p>
        <div className="feat-price-row">
          <span className="feat-price">{product.priceEur}€</span>
          {product.compareAtPriceEur && (
            <span className="feat-price-orig">{product.compareAtPriceEur}€</span>
          )}
        </div>
        <p className="feat-desc">
          Coupe authentique — tissu thermorégulant certifié, broderie officielle, livraison 48h.
        </p>
        <Link href={`/products/${product.id}`} className="btn btn--solid feat-cta">
          Voir le produit
        </Link>
      </div>
    </section>
  )
}
