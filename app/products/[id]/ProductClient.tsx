'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const SPECS: Record<string, Array<{ label: string; value: string }>> = {
  default: [
    { label: 'Matière',    value: '100 % Polyester recyclé' },
    { label: 'Coupe',      value: 'Authentique (joueur)' },
    { label: 'Technologie', value: 'DryFit — évacuation rapide' },
    { label: 'Entretien',  value: 'Lavage 30 °C · Pas de sèche-linge' },
    { label: 'Livraison',  value: '48 h — France métropolitaine' },
    { label: 'Retours',    value: '30 jours · Satisfait ou remboursé' },
  ],
}

export default function ProductClient({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [size,  setSize]  = useState<string | undefined>(undefined)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (added) return
    addItem(product, size)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const specs = SPECS[product.id] ?? SPECS.default
  const catLabel = product.cat.includes('limited')
    ? 'Édition Limitée'
    : product.cat.includes('vintage')
    ? 'Collection Vintage'
    : product.cat.includes('nations')
    ? 'Équipes Nationales'
    : 'Clubs Professionnels'

  return (
    <>
      <Nav />
      <main className="product-page">
        <div className="wrap">
          <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden="true">›</span>
            <Link href="/#shop">Shop</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{product.club}</span>
          </nav>

          <div className="product-grid">
            <div className="product-img-wrap">
              <Image
                src={product.img}
                alt={`${product.club} — ${product.name}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              {product.cat.includes('limited') && (
                <span className="product-img-badge">Édition Limitée</span>
              )}
            </div>

            <div className="product-info">
              <span className="product-cat">{catLabel}</span>
              <span className="product-club">{product.club}</span>
              <h1 className="product-name">{product.name}</h1>
              <p className="product-price">{(product.priceEur / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>

              <div className="product-sizes">
                <p className="product-sizes-label">
                  Taille{size ? <span className="product-sizes-sel"> — {size}</span> : ''}
                </p>
                <div className="product-sizes-grid" role="group" aria-label="Sélectionner une taille">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      className={`size-btn${size === s ? ' active' : ''}`}
                      onClick={() => setSize((prev) => (prev === s ? undefined : s))}
                      aria-pressed={size === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!size && (
                  <p className="product-sizes-hint">Sélectionnez une taille pour continuer</p>
                )}
              </div>

              <button
                className={`btn btn--primary product-add-btn${added ? ' product-add-done' : ''}`}
                onClick={handleAdd}
                disabled={!size}
              >
                {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
              </button>

              <Link href="/cart" className="btn btn--ghost product-cart-btn">
                Voir mon panier →
              </Link>

              <div className="product-specs">
                {specs.map((s) => (
                  <div key={s.label} className="product-spec">
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
