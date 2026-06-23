'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/db/schema'
import {
  type ProductOptions, type Version, type Kit, type Patch,
  unitPriceCents, SHORT_TSHIRT_PRICE_CENTS,
  FLOCAGE_CENTS, PATCH_CENTS, EMBALLAGE_CENTS,
  PATCH_LABEL, formatEur, isVintageCat, versionPrice,
} from '@/lib/pricing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PaymentMarks from '@/components/PaymentMarks'
import { parseImgs, primaryImg } from '@/lib/product-images'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const PATCHES: Patch[] = ['none', 'cdm', 'ligue', 'ldc']

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 8 Q7 4 14 4 Q21 4 24 8"/><path d="M4 14 Q7 10 14 10 Q21 10 24 14"/><path d="M4 20 Q7 16 14 16 Q21 16 24 20"/>
      </svg>
    ),
    title: 'Évacuation de la transpiration',
    desc: "Conçu pour rester sec même lors d'efforts intenses, grâce à une matière respirante.",
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M7 8 L4 18 Q4 22 8 22 L20 22 Q24 22 24 18 L21 8 Z"/><path d="M7 8 L10 4 Q14 2 18 4 L21 8"/><path d="M9 14 Q14 18 19 14"/>
      </svg>
    ),
    title: 'Entretien facile',
    desc: 'Sans plis après lavage. Lavez et portez, aucun repassage nécessaire.',
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M14 4 L14 8"/><path d="M14 20 L14 24"/><path d="M4 14 L8 14"/><path d="M20 14 L24 14"/><circle cx="14" cy="14" r="5"/><path d="M7 7 L10 10"/><path d="M18 18 L21 21"/><path d="M21 7 L18 10"/><path d="M10 18 L7 21"/>
      </svg>
    ),
    title: 'Ultra respirant',
    desc: "Un tissu léger qui laisse circuler l'air pour un confort optimal, même en plein effort.",
  },
  {
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M14 4 Q20 8 20 14 Q20 22 14 24 Q8 22 8 14 Q8 8 14 4Z"/><path d="M11 14 L13 16 L17 12"/>
      </svg>
    ),
    title: 'Propriétés antibactériennes',
    desc: "Empêche la formation d'odeurs grâce à un traitement antibactérien avancé.",
  },
]

function TruckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>
}
function ReturnIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M3 9a8 8 0 1 1-1 4" /><path d="M3 4v5h5" /></svg>
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
}

export default function ProductClient({ product }: { product: Product }) {
  const addItem   = useCartStore((s) => s.addItem)
  const isVintage = isVintageCat(product.cat)
  const allImgs   = parseImgs(product.img)
  const [activeImg, setActiveImg] = useState(0)
  const [size,      setSize]      = useState<string | undefined>(undefined)
  const [version,   setVersion]   = useState<Version>('fan')
  const [kit,       setKit]       = useState<Kit>('jersey')
  const [flocage,   setFlocage]   = useState(false)
  const [patch,     setPatch]     = useState<Patch>('none')
  const [emballage, setEmballage] = useState(false)
  const [added,     setAdded]     = useState(false)
  const [sizeGuide, setSizeGuide] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const options: ProductOptions  = { version, kit, flocage, patch, emballage }
  const unitPrice                = unitPriceCents(options, isVintage, product.priceEur)
  const gridKit: 'jersey' | 'set' = kit === 'set' ? 'set' : 'jersey'
  const showVersion              = !isVintage && kit !== 'short_tshirt'

  const catLabel = product.cat.includes('limited')
    ? 'Édition Limitée'
    : product.cat.includes('vintage')
    ? 'Collection Vintage'
    : product.cat.includes('nations')
    ? 'Équipes Nationales'
    : 'Clubs Professionnels'

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
    addItem(product, { size, options })
    setAdded(true)
    setSizeError(false)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <>
      <Nav />
      <main className="pd2-page">

        {/* ── BREADCRUMB ───────────────────────────────────── */}
        <div className="wrap">
          <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden="true">›</span>
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{product.club}</span>
          </nav>
        </div>

        {/* ── MAIN GRID ────────────────────────────────────── */}
        <div className="pd2-grid">

          {/* LEFT — gallery */}
          <div className="pd2-gallery">
            {/* Hero image */}
            <div className="pd2-hero">
              <Image
                src={allImgs[activeImg] ?? primaryImg(product.img)}
                alt={`${product.club} — ${product.name}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              {product.cat.includes('limited') && (
                <span className="pd2-hero-badge">Édition Limitée</span>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImgs.length > 1 && (
              <div className="pd2-thumbs" role="list" aria-label="Autres photos">
                {allImgs.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    role="listitem"
                    className={`pd2-thumb${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Photo ${i + 1}`}
                    aria-pressed={i === activeImg}
                  >
                    <Image src={url} alt={`${product.name} photo ${i + 1}`} width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — info + options */}
          <div className="pd2-right">

            {/* ── Badge + Title + Price ───────────────────── */}
            <div className="pd2-header">
              <span className="pd2-badge">{catLabel}</span>
              <h1 className="pd2-title">
                {product.club}
                <span className="pd2-title-sub">{product.name}</span>
              </h1>
              <div className="pd2-price">{formatEur(unitPrice)}</div>
              {isVintage && (
                <p className="pd-vintage-note">Édition vintage — pièce rétro au prix unique.</p>
              )}
            </div>

            {/* ── Options ─────────────────────────────────── */}

            {/* Version */}
            {showVersion && (
              <div className="pd-option-group">
                <span className="pd-option-label">Version</span>
                <div className="pd-toggles">
                  <button type="button" className={`pd-toggle${version === 'fan' ? ' active' : ''}`} onClick={() => setVersion('fan')}>
                    Fan <span className="pd-toggle-price">{formatEur(versionPrice('fan', gridKit, product.priceEur))}</span>
                  </button>
                  <button type="button" className={`pd-toggle${version === 'player' ? ' active' : ''}`} onClick={() => setVersion('player')}>
                    Player <span className="pd-toggle-price">{formatEur(versionPrice('player', gridKit, product.priceEur))}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Type */}
            {!isVintage && (
              <div className="pd-option-group">
                <span className="pd-option-label">Type</span>
                <div className="pd-toggles pd-toggles--wrap">
                  <button type="button" className={`pd-toggle${kit === 'jersey' ? ' active' : ''}`} onClick={() => setKit('jersey')}>Maillot seul</button>
                  <button type="button" className={`pd-toggle${kit === 'set' ? ' active' : ''}`} onClick={() => setKit('set')}>Ensemble + short</button>
                  <button type="button" className={`pd-toggle${kit === 'short_tshirt' ? ' active' : ''}`} onClick={() => setKit('short_tshirt')}>
                    Short + t-shirt <span className="pd-toggle-price">{formatEur(SHORT_TSHIRT_PRICE_CENTS)}</span>
                  </button>
                </div>
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
                onChange={(e) => { setSize(e.target.value || undefined); if (e.target.value) setSizeError(false) }}
              >
                <option value="">Sélectionner une taille</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {sizeError && <p className="pd-field-error" role="alert">Sélectionne une taille pour continuer.</p>}
              <div className="pd-links-row">
                <button type="button" className="pd-link" onClick={() => setSizeGuide(true)}>📏 Guide des tailles</button>
              </div>
            </div>

            {/* Flocage */}
            <div className="pd-option-group">
              <span className="pd-option-label">Flocage (nom + numéro) <span className="pd-extra">(+{formatEur(FLOCAGE_CENTS)})</span></span>
              <div className="pd-toggles">
                <button type="button" className={`pd-toggle${!flocage ? ' active' : ''}`} onClick={() => setFlocage(false)}>Non</button>
                <button type="button" className={`pd-toggle${flocage ? ' active' : ''}`} onClick={() => setFlocage(true)}>Oui</button>
              </div>
            </div>

            {/* Patch */}
            <div className="pd-option-group">
              <label className="pd-option-label" htmlFor="pd-patch">Patch <span className="pd-extra">(+{formatEur(PATCH_CENTS)})</span></label>
              <select id="pd-patch" className="pd-select" value={patch} onChange={(e) => setPatch(e.target.value as Patch)}>
                {PATCHES.map((p) => <option key={p} value={p}>{PATCH_LABEL[p]}</option>)}
              </select>
            </div>

            {/* Emballage */}
            <div className="pd-option-group">
              <span className="pd-option-label">Emballage cadeau <span className="pd-extra">(+{formatEur(EMBALLAGE_CENTS)})</span></span>
              <div className="pd-toggles">
                <button type="button" className={`pd-toggle${!emballage ? ' active' : ''}`} onClick={() => setEmballage(false)}>Non</button>
                <button type="button" className={`pd-toggle${emballage ? ' active' : ''}`} onClick={() => setEmballage(true)}>Oui 🎁</button>
              </div>
            </div>

            {/* Stock urgency */}
            {product.stock > 0 && product.stock < 10 && (
              <div className="pd-urgency"><span className="pd-urgency-dot" /> Il ne reste que quelques articles</div>
            )}

            {/* CTA */}
            <button type="button" className={`pd-add-btn${added ? ' pd-added' : ''}`} onClick={handleAdd}>
              {added ? '✓ AJOUTÉ AU PANIER' : size ? 'AJOUTER AU PANIER' : 'SÉLECTIONNER UNE TAILLE'}
            </button>

            {/* Réassurance */}
            <ul className="pd-reassure">
              <li><span className="pd-reassure-ic"><TruckIcon /></span> Préparation 3–4 jours · livraison 10–15 jours</li>
              <li><span className="pd-reassure-ic"><ReturnIcon /></span> Retours sous 14 jours</li>
              <li><span className="pd-reassure-ic"><LockIcon /></span> Paiement 100% sécurisé</li>
              <li><span className="pd-reassure-ic"><ShieldIcon /></span> Personnalisés non échangeables</li>
            </ul>

            <PaymentMarks />
          </div>
        </div>

        {/* ── FEATURES (4 blocs en bas) ────────────────────── */}
        <div className="wrap">
          <div className="pd2-features">
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
      </main>

      {/* Size guide modal */}
      {sizeGuide && (
        <div className="sizeguide-overlay" role="dialog" aria-modal="true" aria-labelledby="sizeguide-title" onClick={() => setSizeGuide(false)}>
          <div className="sizeguide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sizeguide-close" onClick={() => setSizeGuide(false)} aria-label="Fermer">×</button>
            <h2 id="sizeguide-title" className="sizeguide-title">Guide des tailles</h2>
            <p className="sizeguide-sub">Mesures en centimètres. Entre deux tailles, choisissez la plus grande.</p>
            <table className="sizeguide-table">
              <thead><tr><th>Taille</th><th>Poitrine</th><th>Longueur</th></tr></thead>
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

      {/* Mobile sticky */}
      <div className="pd-sticky-mobile" aria-label="Ajouter au panier">
        <div>
          <span className="pd-sticky-label">{product.club}</span>
          <strong>{formatEur(unitPrice)}</strong>
        </div>
        <button type="button" className={`pd-sticky-btn${added ? ' pd-added' : ''}`} onClick={handleAdd}>
          {added ? '✓ Ajouté' : size ? 'Ajouter' : 'Choisir taille'}
        </button>
      </div>

      <Footer />
    </>
  )
}
