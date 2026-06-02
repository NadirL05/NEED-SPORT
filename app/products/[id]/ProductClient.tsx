'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const BADGES = [
  'Ligue 1',
  'Ligue des Champions',
  'Europa League',
  'Coupe de France',
  'Coupe du Monde 2026',
]

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 8 Q7 4 14 4 Q21 4 24 8"/>
        <path d="M4 14 Q7 10 14 10 Q21 10 24 14"/>
        <path d="M4 20 Q7 16 14 16 Q21 16 24 20"/>
      </svg>
    ),
    title: 'Évacuation de la transpiration',
    desc: "Conçu pour rester sec même lors d'efforts intenses, grâce à une matière respirante.",
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M7 8 L4 18 Q4 22 8 22 L20 22 Q24 22 24 18 L21 8 Z"/>
        <path d="M7 8 L10 4 Q14 2 18 4 L21 8"/>
        <path d="M9 14 Q14 18 19 14"/>
      </svg>
    ),
    title: 'Entretien facile',
    desc: 'Sans plis après lavage. Lavez et portez, aucun repassage nécessaire.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M14 4 L14 8"/>
        <path d="M14 20 L14 24"/>
        <path d="M4 14 L8 14"/>
        <path d="M20 14 L24 14"/>
        <circle cx="14" cy="14" r="5"/>
        <path d="M7 7 L10 10"/>
        <path d="M18 18 L21 21"/>
        <path d="M21 7 L18 10"/>
        <path d="M10 18 L7 21"/>
      </svg>
    ),
    title: 'Ultra respirant',
    desc: "Un tissu léger qui laisse circuler l'air pour un confort optimal, même en plein effort.",
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M14 4 Q20 8 20 14 Q20 22 14 24 Q8 22 8 14 Q8 8 14 4Z"/>
        <path d="M11 14 L13 16 L17 12"/>
      </svg>
    ),
    title: 'Propriétés antibactériennes',
    desc: "Empêche la formation d'odeurs grâce à un traitement antibactérien avancé.",
  },
]

function GiftIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 26, height: 26 }}>
      <rect x="4" y="12" width="24" height="4" rx="1"/>
      <rect x="6" y="16" width="20" height="12" rx="1"/>
      <path d="M16 12 L16 28"/>
      <path d="M10 12 Q10 7 16 7 Q16 12 16 12"/>
      <path d="M22 12 Q22 7 16 7 Q16 12 16 12"/>
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 26, height: 26 }}>
      <rect x="5" y="10" width="22" height="18" rx="2"/>
      <path d="M11 10 Q11 5 16 5 Q21 5 21 10"/>
    </svg>
  )
}

function ApplePayIcon() {
  return (
    <svg viewBox="0 0 40 16" fill="currentColor" style={{ width: 36, height: 14 }}>
      <text x="0" y="12" fontSize="11" fontFamily="'-apple-system, sans-serif'" fontWeight="600" letterSpacing="0.02em"></text>
      <text x="0" y="12" fontSize="10" fontFamily="ui-sans-serif, sans-serif" fontWeight="500">Pay</text>
    </svg>
  )
}

export default function ProductClient({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [size,       setSize]       = useState<string | undefined>(undefined)
  const [flocage,    setFlocage]    = useState<'non' | 'oui'>('non')
  const [flocageBas, setFlocageBas] = useState<'non' | 'oui'>('non')
  const [badge,      setBadge]      = useState('')
  const [emballage,  setEmballage]  = useState(true)
  const [added,      setAdded]      = useState(false)

  const emballageCents = emballage ? 699 : 0
  const displayPrice   = product.priceEur + emballageCents

  const catLabel = product.cat.includes('limited')
    ? 'Édition Limitée'
    : product.cat.includes('vintage')
    ? 'Collection Vintage'
    : product.cat.includes('nations')
    ? 'Équipes Nationales'
    : 'Clubs Professionnels'

  const handleAdd = () => {
    if (added) return
    addItem(product, size)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

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

          <div className="product-layout">
            {/* LEFT — image + features */}
            <div className="product-left">
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

              <div className="product-features">
                {FEATURES.map((f) => (
                  <div key={f.title} className="pf-item">
                    <div className="pf-icon">{f.icon}</div>
                    <div>
                      <p className="pf-title">{f.title}</p>
                      <p className="pf-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — options + CTA */}
            <div className="product-right">
              <span className="product-cat">{catLabel}</span>
              <h1 className="product-name">
                MAILLOT {product.club.toUpperCase()}
                <br />
                {product.name.toUpperCase()}
              </h1>

              <div className="product-price-row">
                <span className="product-price-main">
                  {(displayPrice / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                {product.compareAtPriceEur && (
                  <>
                    <s className="product-price-compare">
                      {(product.compareAtPriceEur / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </s>
                    <span className="product-sale-badge">SOLDES</span>
                  </>
                )}
              </div>

              {/* Taille */}
              <div className="pd-option-group">
                <label className="pd-option-label" htmlFor="pd-size">Taille</label>
                <select
                  id="pd-size"
                  className="pd-select"
                  value={size ?? ''}
                  onChange={(e) => setSize(e.target.value || undefined)}
                >
                  <option value="">Sélectionner une taille</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pd-links-row">
                  <a href="#" className="pd-link">Guide de Taille 📏</a>
                  <a href="#" className="pd-link">Où est le logo de la marque ?</a>
                </div>
              </div>

              {/* Flocage */}
              <div className="pd-option-group">
                <span className="pd-option-label">
                  Flocage <span className="pd-free">(OFFERT)</span> *
                </span>
                <div className="pd-toggles">
                  <button
                    type="button"
                    className={`pd-toggle${flocage === 'non' ? ' active' : ''}`}
                    onClick={() => setFlocage('non')}
                  >Non</button>
                  <button
                    type="button"
                    className={`pd-toggle${flocage === 'oui' ? ' active' : ''}`}
                    onClick={() => setFlocage('oui')}
                  >Oui</button>
                </div>
              </div>

              {/* Flocage Bas */}
              <div className="pd-option-group">
                <span className="pd-option-label">
                  Flocage Bas <span className="pd-free">(OFFERT)</span> *
                </span>
                <div className="pd-toggles">
                  <button
                    type="button"
                    className={`pd-toggle${flocageBas === 'non' ? ' active' : ''}`}
                    onClick={() => setFlocageBas('non')}
                  >Non</button>
                  <button
                    type="button"
                    className={`pd-toggle${flocageBas === 'oui' ? ' active' : ''}`}
                    onClick={() => setFlocageBas('oui')}
                  >Oui</button>
                </div>
                <a href="#" className="pd-link">À quoi correspondent les flocages ?</a>
              </div>

              {/* Badges */}
              <div className="pd-option-group">
                <label className="pd-option-label" htmlFor="pd-badge">Badges :</label>
                <select
                  id="pd-badge"
                  className="pd-select"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                >
                  <option value="">-- Sans badge --</option>
                  {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Emballage */}
              <div className="pd-option-group">
                <span className="pd-option-label">
                  Emballage * <span className="pd-extra">(+€6,99)</span>
                </span>
                <div className="pd-emballage">
                  <button
                    type="button"
                    className={`pd-emb-btn${emballage ? ' active' : ''}`}
                    onClick={() => setEmballage(true)}
                    aria-label="Avec emballage cadeau"
                  >
                    <GiftIcon />
                  </button>
                  <button
                    type="button"
                    className={`pd-emb-btn${!emballage ? ' active' : ''}`}
                    onClick={() => setEmballage(false)}
                    aria-label="Sans emballage"
                  >
                    <BagIcon />
                  </button>
                </div>
                <p className="pd-emb-note">
                  Cette sélection ajoutera <strong>€6,99</strong> au prix.
                </p>
              </div>

              {/* Urgency */}
              {product.stock > 0 && product.stock < 10 && (
                <div className="pd-urgency">
                  <span className="pd-urgency-dot" />
                  Il ne reste que quelques articles
                </div>
              )}

              {/* Add to cart */}
              <button
                type="button"
                className={`pd-add-btn${added ? ' pd-added' : ''}`}
                onClick={handleAdd}
                disabled={!size}
              >
                {added ? '✓ AJOUTÉ AU PANIER' : 'AJOUTER AU PANIER'}
              </button>

              {/* Apple Pay */}
              <button type="button" className="pd-applepay-btn">
                <span className="pd-apple-symbol"></span>
                Acheter avec&nbsp;<strong>Apple Pay</strong>
              </button>

              <a href="#" className="pd-more-pay">Plus de moyens de paiement</a>

              {/* Payment logos */}
              <div className="pd-payment-icons">
                {['APPLE PAY', 'VISA', 'KLARNA', 'MC', 'G PAY', 'AMEX'].map((p) => (
                  <span key={p} className="pd-pay-icon">{p}</span>
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
