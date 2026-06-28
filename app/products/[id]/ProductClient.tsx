'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'
import {
  type ProductOptions, type Version, type Kit, type Patch,
  unitPriceCents, basePriceCents,
  FLOCAGE_CENTS, PATCH_CENTS, EMBALLAGE_CENTS,
  PLAYER_SURCHARGE_CENTS, SET_SURCHARGE_CENTS,
  PATCH_LABEL, formatEur, isVintageCat,
} from '@/lib/pricing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PaymentMarks from '@/components/PaymentMarks'
import { parseImgs } from '@/lib/product-images'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const PATCHES: Patch[] = ['none', 'cdm', 'ligue', 'ldc']

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

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  )
}
function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M3 9a8 8 0 1 1-1 4" /><path d="M3 4v5h5" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export default function ProductClient({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const isVintage = isVintageCat(product.cat)
  const allImgs = parseImgs(product.img).slice(0, 4)
  const [size,         setSize]         = useState<string | undefined>(undefined)
  const [version,      setVersion]      = useState<Version>('fan')
  const [kit,          setKit]          = useState<Kit>('jersey')
  const [flocage,      setFlocage]      = useState(false)
  const [patch,        setPatch]        = useState<Patch>('none')
  const [emballage,    setEmballage]    = useState(false)
  const [playerName,   setPlayerName]   = useState('')
  const [playerNumber, setPlayerNumber] = useState('')
  const [quantity,     setQuantity]     = useState(1)
  const [added,        setAdded]        = useState(false)
  const [sizeGuide,    setSizeGuide]    = useState(false)
  const [sizeError,    setSizeError]    = useState(false)

  const options: ProductOptions = { version, kit, flocage, patch, emballage }
  const unitPrice  = unitPriceCents(product.priceEur, options, isVintage)
  const totalPrice = unitPrice * quantity
  const showVersion = !isVintage

  useEffect(() => {
    if (!sizeGuide) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSizeGuide(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [sizeGuide])

  const handleAdd = () => {
    if (added) return
    if (!size) {
      setSizeError(true)
      document.getElementById('pd-size')?.focus()
      return
    }
    addItem(product, { size, options, playerName: playerName || undefined, playerNumber: playerNumber || undefined, quantity })
    setAdded(true)
    setSizeError(false)
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
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{product.club}</span>
          </nav>

          <header className="product-intro">
            <p className="product-eyebrow">{product.club}</p>
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price-row" aria-live="polite" aria-atomic="true">
              <span className="product-price-main">{formatEur(totalPrice)}</span>
              {quantity > 1 && (
                <span className="product-price-sub">{quantity} × {formatEur(unitPrice)}</span>
              )}
            </div>

            {isVintage && (
              <p className="pd-vintage-note">Édition vintage — pièce rétro au prix unique.</p>
            )}
          </header>

          <section className="product-gallery" aria-label={`Photos de ${product.name}`}>
            <div className={`product-gallery-grid product-gallery-grid--${allImgs.length}`}>
              {allImgs.map((url, index) => (
                <figure className="product-gallery-item" key={index}>
                  <Image
                    src={url}
                    alt={`${product.name} — vue ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes={index === 0
                      ? '(max-width: 768px) 92vw, 64vw'
                      : '(max-width: 768px) 92vw, 32vw'}
                    className="product-gallery-image"
                  />
                  {index === 0 && product.cat.includes('limited') && (
                    <span className="product-img-badge">Édition Limitée</span>
                  )}
                  <figcaption className="product-gallery-count">
                    {String(index + 1).padStart(2, '0')} / {String(allImgs.length).padStart(2, '0')}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="product-options" aria-labelledby="product-options-title">
            <div className="product-options-panel">
              <div className="product-options-head">
                <p className="product-options-kicker">Personnalisation</p>
                <h2 id="product-options-title">Composez votre maillot</h2>
              </div>

              {/* Version */}
              {showVersion && (
                <div className="pd-option-group">
                  <span className="pd-option-label">Version</span>
                  <div className="pd-toggles">
                    <button
                      type="button"
                      className={`pd-toggle${version === 'fan' ? ' active' : ''}`}
                      aria-pressed={version === 'fan'}
                      onClick={() => setVersion('fan')}
                    >
                      Fan <span className="pd-toggle-price">
                        {formatEur(basePriceCents(product.priceEur, { ...options, version: 'fan' }))}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`pd-toggle${version === 'player' ? ' active' : ''}`}
                      aria-pressed={version === 'player'}
                      onClick={() => setVersion('player')}
                    >
                      Player <span className="pd-toggle-price">
                        {formatEur(basePriceCents(product.priceEur, { ...options, version: 'player' }))}
                      </span>
                    </button>
                  </div>
                </div>
              )}


              {/* Player bar — inline (desktop) / fixed bottom (mobile) */}
              {showVersion && !isVintage && version === 'player' && (
                <div className="pd-player-bar">
                  <p className="pd-player-bar-title">Personnalisation joueur</p>
                  <div className="pd-flocage-inputs">
                    <div className="pd-flocage-field">
                      <label className="pd-flocage-label" htmlFor="player-bar-name">Nom</label>
                      <input
                        id="player-bar-name"
                        className="pd-flocage-input"
                        type="text"
                        maxLength={20}
                        placeholder="NOM DU JOUEUR"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="pd-flocage-field pd-flocage-field--num">
                      <label className="pd-flocage-label" htmlFor="player-bar-number">N°</label>
                      <input
                        id="player-bar-number"
                        className="pd-flocage-input pd-flocage-input--num"
                        type="text"
                        maxLength={2}
                        placeholder="00"
                        value={playerNumber}
                        onChange={(e) => setPlayerNumber(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Type */}
              {!isVintage && (
                <div className="pd-option-group">
                  <span className="pd-option-label">Type</span>
                  <div className="pd-toggles pd-toggles--wrap">
                    <button
                      type="button"
                      className={`pd-toggle${kit === 'jersey' ? ' active' : ''}`}
                      aria-pressed={kit === 'jersey'}
                      onClick={() => setKit('jersey')}
                    >Maillot seul</button>
                    <button
                      type="button"
                      className={`pd-toggle${kit === 'set' ? ' active' : ''}`}
                      aria-pressed={kit === 'set'}
                      onClick={() => setKit('set')}
                    >
                      Ensemble <span className="pd-toggle-price">
                        {formatEur(basePriceCents(product.priceEur, { ...options, kit: 'set' }))}
                      </span>
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <circle cx="6.5" cy="6.5" r="5.5" stroke="#9CA3AF" strokeWidth="1.2" />
                      <path d="M4.5 6.5l1.5 1.5L8.5 5" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {kit === 'jersey' ? 'Inclus : Maillot uniquement' : 'Inclus : Maillot + Short'}
                  </p>
                </div>
              )}

              {/* Taille */}
              <div className="pd-option-group">
                <label className="pd-option-label" htmlFor="pd-size">Taille</label>
                <select
                  id="pd-size"
                  className={`pd-select${sizeError ? ' pd-select--error' : ''}`}
                  value={size ?? ''}
                  aria-invalid={sizeError}
                  onChange={(e) => {
                    setSize(e.target.value || undefined)
                    if (e.target.value) setSizeError(false)
                  }}
                >
                  <option value="">Sélectionner une taille</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {sizeError && <p className="pd-field-error" role="alert">Sélectionne une taille pour continuer.</p>}
                <div className="pd-links-row">
                  <button type="button" className="pd-link" onClick={() => setSizeGuide(true)}>
                    📏 Guide des tailles
                  </button>
                </div>
              </div>

              {/* Flocage */}
              <div className="pd-option-group">
                <span className="pd-option-label">
                  Flocage (nom + numéro) <span className="pd-extra">(+{formatEur(FLOCAGE_CENTS)})</span>
                </span>
                <div className="pd-toggles">
                  <button
                    type="button"
                    className={`pd-toggle${!flocage ? ' active' : ''}`}
                    aria-pressed={!flocage}
                    onClick={() => { setFlocage(false); setPlayerName(''); setPlayerNumber('') }}
                  >Non</button>
                  <button
                    type="button"
                    className={`pd-toggle${flocage ? ' active' : ''}`}
                    aria-pressed={flocage}
                    onClick={() => setFlocage(true)}
                  >Oui</button>
                </div>
                {flocage && (
                  <div className="pd-flocage-fields">
                    <input
                      type="text"
                      className="pd-select"
                      placeholder="Nom à floquer (ex : MBAPPÉ)"
                      maxLength={20}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      aria-label="Nom à floquer"
                      style={{ marginTop: '0.75rem' }}
                    />
                    <input
                      type="text"
                      className="pd-select"
                      placeholder="Numéro (ex : 7)"
                      maxLength={3}
                      value={playerNumber}
                      onChange={(e) => setPlayerNumber(e.target.value.replace(/\D/g, ''))}
                      aria-label="Numéro à floquer"
                      style={{ marginTop: '0.5rem' }}
                    />
                  </div>
                )}
              </div>

              {/* Patch */}
              <div className="pd-option-group">
                <label className="pd-option-label" htmlFor="pd-patch">
                  Patch <span className="pd-extra">(+{formatEur(PATCH_CENTS)})</span>
                </label>
                <select
                  id="pd-patch"
                  className="pd-select"
                  value={patch}
                  onChange={(e) => setPatch(e.target.value as Patch)}
                >
                  {PATCHES.map((p) => <option key={p} value={p}>{PATCH_LABEL[p]}</option>)}
                </select>
              </div>

              {/* Emballage */}
              <div className="pd-option-group">
                <span className="pd-option-label">
                  Emballage cadeau <span className="pd-extra">(+{formatEur(EMBALLAGE_CENTS)})</span>
                </span>
                <div className="pd-emballage">
                  <button
                    type="button"
                    className={`pd-emb-btn${emballage ? ' active' : ''}`}
                    aria-pressed={emballage}
                    onClick={() => setEmballage(true)}
                    aria-label="Avec emballage cadeau"
                  >
                    <GiftIcon />
                  </button>
                  <button
                    type="button"
                    className={`pd-emb-btn${!emballage ? ' active' : ''}`}
                    aria-pressed={!emballage}
                    onClick={() => setEmballage(false)}
                    aria-label="Sans emballage"
                  >
                    <BagIcon />
                  </button>
                </div>
              </div>

              {/* Quantité */}
              <div className="pd-option-group">
                <span className="pd-option-label">Quantité</span>
                <div className="pd-qty">
                  <button
                    type="button"
                    className="pd-qty-btn"
                    aria-label="Diminuer la quantité"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >−</button>
                  <span className="pd-qty-val" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    className="pd-qty-btn"
                    aria-label="Augmenter la quantité"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >+</button>
                </div>
              </div>

              {/* Urgency */}
              {product.stock > 0 && product.stock < 10 && (
                <div className="pd-urgency">
                  <span className="pd-urgency-dot" />
                  Il ne reste que quelques articles
                </div>
              )}

              {/* Prix détaillé */}
              <div className="pd-price-summary" aria-live="polite" aria-atomic="true">
                <div className="pd-price-summary-row">
                  <span>Prix de base</span>
                  <span>{formatEur(product.priceEur)}</span>
                </div>
                {!isVintage && version === 'player' && (
                  <div className="pd-price-summary-row">
                    <span>Version Player</span>
                    <span>+{formatEur(PLAYER_SURCHARGE_CENTS)}</span>
                  </div>
                )}
                {!isVintage && kit === 'set' && (
                  <div className="pd-price-summary-row">
                    <span>Ensemble (maillot + short)</span>
                    <span>+{formatEur(SET_SURCHARGE_CENTS)}</span>
                  </div>
                )}
                {flocage && (
                  <div className="pd-price-summary-row">
                    <span>Flocage (nom + numéro)</span>
                    <span>+{formatEur(FLOCAGE_CENTS)}</span>
                  </div>
                )}
                {patch !== 'none' && (
                  <div className="pd-price-summary-row">
                    <span>Patch {PATCH_LABEL[patch]}</span>
                    <span>+{formatEur(PATCH_CENTS)}</span>
                  </div>
                )}
                {emballage && (
                  <div className="pd-price-summary-row">
                    <span>Emballage cadeau</span>
                    <span>+{formatEur(EMBALLAGE_CENTS)}</span>
                  </div>
                )}
                <div className="pd-price-summary-total">
                  <span>{quantity > 1 ? `Total (${quantity} articles)` : 'Total'}</span>
                  <strong>{formatEur(totalPrice)}</strong>
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                className={`pd-add-btn${added ? ' pd-added' : ''}`}
                onClick={handleAdd}
              >
                {added ? '✓ AJOUTÉ AU PANIER' : size ? 'AJOUTER AU PANIER' : 'SÉLECTIONNER UNE TAILLE'}
              </button>

              {/* Réassurance */}
              <ul className="pd-reassure">
                <li><span className="pd-reassure-ic"><TruckIcon /></span> Préparation 3–4 jours · livraison 10–15 jours</li>
                <li><span className="pd-reassure-ic"><ReturnIcon /></span> Retours sous 14 jours</li>
                <li><span className="pd-reassure-ic"><LockIcon /></span> Paiement 100% sécurisé</li>
                <li><span className="pd-reassure-ic"><ShieldIcon /></span> Personnalisés non échangeables</li>
              </ul>

              {/* Payment logos */}
              <PaymentMarks />
            </div>
          </section>

          <section className="product-characteristics" aria-labelledby="product-characteristics-title">
            <div className="product-characteristics-head">
              <p>Conçu pour jouer. Pensé pour durer.</p>
              <h2 id="product-characteristics-title" className="display">Caractéristiques</h2>
            </div>
            <div className="product-features">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="pf-item">
                  <div className="pf-icon">{feature.icon}</div>
                  <div>
                    <h3 className="pf-title">{feature.title}</h3>
                    <p className="pf-desc">{feature.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {sizeGuide && (
        <div
          className="sizeguide-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sizeguide-title"
          onClick={() => setSizeGuide(false)}
        >
          <div className="sizeguide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sizeguide-close" onClick={() => setSizeGuide(false)} aria-label="Fermer le guide des tailles">×</button>
            <h2 id="sizeguide-title" className="sizeguide-title">Guide des tailles</h2>
            <p className="sizeguide-sub">Mesures en centimètres. Entre deux tailles, choisissez la plus grande.</p>
            <table className="sizeguide-table">
              <thead>
                <tr><th>Taille</th><th>Poitrine</th><th>Longueur</th></tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>92–98</td><td>69</td></tr>
                <tr><td>M</td><td>98–104</td><td>71</td></tr>
                <tr><td>L</td><td>104–110</td><td>73</td></tr>
                <tr><td>XL</td><td>110–118</td><td>75</td></tr>
                <tr><td>XXL</td><td>118–126</td><td>77</td></tr>
              </tbody>
            </table>
            <p className="sizeguide-note">Coupe standard adulte · mesures indicatives (±2 cm).</p>
          </div>
        </div>
      )}

      <div className="pd-sticky-mobile" aria-label="Ajouter au panier">
        <div>
          <span className="pd-sticky-label">{product.club}</span>
          <strong>{formatEur(totalPrice)}</strong>
        </div>
        <button
          type="button"
          className={`pd-sticky-btn${added ? ' pd-added' : ''}`}
          onClick={handleAdd}
        >
          {added ? '✓ Ajouté' : size ? 'Ajouter' : 'Commander'}
        </button>
      </div>

      <Footer />
    </>
  )
}
