# NEED SPORT — Redesign couche visuelle — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refaire la couche visuelle de la homepage NEED SPORT — Hero mega-typo Nike-scale, Editorial Tiles 80vh, grille catalogue avec featured card + hover overlay "VOIR", signature footer Bebas, HUD immersive — fond blanc `#FAFAF9` partout sauf le Pitch `#0A0A0B`.

**Architecture:** Remplacement composant par composant, sans toucher aux routes ni à la data layer. Un nouveau composant `EditorialTiles` remplace `FeaturedDrop`. Tous les styles passent par `app/globals.css`.

**Tech Stack:** Next.js 16 App Router · CSS custom properties · React hooks (useRef, useEffect) · next/image · Zustand (inchangé)

**Spec:** `docs/superpowers/specs/2026-05-31-redesign-visual-layer.md`

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `app/globals.css` | Modifié — tokens, editorial tiles, shop overlay, featured, footer sig, pitch scale |
| `components/Hero.tsx` | Remplacé — suppression radar/aurora/dial, mega-titre Bebas |
| `components/EditorialTiles.tsx` | Créé — 2 dalles 80vh style Nike |
| `app/page.tsx` | Modifié — FeaturedDrop → EditorialTiles |
| `components/ShopSection.tsx` | Modifié — featured card + overlay VOIR |
| `components/Footer.tsx` | Modifié — signature Bebas oversized |
| `components/ImmersiveSection.tsx` | Modifié — HUD stats monospace |

---

## Task 1 — CSS : tokens + utilitaires globaux

**Files:**
- Modify: `app/globals.css`

- [ ] Ajouter `--pitch: #0A0A0B;` dans le bloc `:root` (après `--border-hover`)

- [ ] Ajouter à la fin de `app/globals.css`, avant le dernier `@media` de responsive, les blocs suivants :

```css
/* === EDITORIAL TILES === */
.editorial-sec { padding: 0; }
.editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 80vh;
  min-height: 500px;
}
.editorial-tile {
  position: relative;
  overflow: hidden;
  display: block;
  text-decoration: none;
}
.editorial-tile-img {
  position: absolute;
  inset: 0;
  transition: transform 700ms var(--ease-out);
}
.editorial-tile:hover .editorial-tile-img { transform: scale(1.04); }
.editorial-tile-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%);
  transition: background 500ms var(--ease);
}
.editorial-tile:hover .editorial-tile-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%);
}
.editorial-tile-content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 48px;
  color: #fff;
}
.editorial-tile-category {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: 10px;
}
.editorial-tile-label {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 5vw, 6rem);
  line-height: 0.9;
  margin-bottom: 28px;
  text-transform: uppercase;
}
.editorial-tile .btn--ghost { border-color: rgba(255,255,255,0.35); color: #fff; }
.editorial-tile .btn--ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(0,194,255,0.5); }

/* === SHOP CARD OVERLAY === */
.shop-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.48);
  opacity: 0;
  transition: opacity 350ms var(--ease);
  display: grid;
  place-items: center;
  pointer-events: none;
}
.shop-card-overlay span {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  color: #fff;
  letter-spacing: 0.2em;
}
.shop-card:hover .shop-card-overlay,
.shop-featured:hover .shop-card-overlay { opacity: 1; }

/* === SHOP FEATURED === */
.shop-featured {
  display: block;
  position: relative;
  overflow: hidden;
  aspect-ratio: 21 / 9;
  margin-bottom: 24px;
  text-decoration: none;
  border-radius: var(--r-card);
  background: linear-gradient(180deg, #EAE7E3, #D6D0C8);
}
.shop-featured-media { position: absolute; inset: 0; }
.shop-featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 60%);
}
.shop-featured-info {
  position: absolute;
  bottom: 0; left: 0;
  padding: 40px 48px;
  color: #fff;
}
.shop-featured-name {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 0.9;
  text-transform: uppercase;
  margin: 6px 0 10px;
}
.shop-featured-price {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

/* === FOOTER SIGNATURE === */
.footer-signature {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: clamp(4rem, 10vw, 10rem);
  letter-spacing: -0.01em;
  line-height: 0.85;
  color: var(--text);
  padding-top: 60px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 48px;
}

/* === HUD STATS (Immersive) === */
.hud-stats {
  position: absolute;
  bottom: 48px; right: 48px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
  text-align: right;
}
.hud-stat { display: flex; flex-direction: column; gap: 2px; }
.hud-label {
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  font-family: ui-monospace, 'Courier New', monospace;
}
.hud-value {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.85);
  font-family: ui-monospace, 'Courier New', monospace;
}

/* === PITCH scale override === */
.pitch-sec .sec-head h2 {
  font-size: clamp(5rem, 12vw, 14rem);
  text-wrap: unset;
  line-height: 0.85;
}

/* === RESPONSIVE editorial + hud === */
@media (max-width: 768px) {
  .editorial-grid { grid-template-columns: 1fr; height: auto; }
  .editorial-tile { height: 70vh; }
  .editorial-tile-content { padding: 32px 24px; }
  .shop-featured { aspect-ratio: 4/3; }
  .shop-featured-info { padding: 24px; }
  .hud-stats { bottom: 120px; right: 20px; }
}
```

- [ ] Vérifier `npx tsc --noEmit` — sortie vide attendue

- [ ] Commit :
```bash
git add app/globals.css
git commit -m "style: tokens pitch + utilitaires editorial/shop/footer/hud"
```

---

## Task 2 — Hero : mega-typo, suppression radar/aurora/dial

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `app/globals.css` (section `.hero`)

- [ ] Remplacer **intégralement** `components/Hero.tsx` par :

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const onScroll = () => {
      const sy = Math.min(window.scrollY, window.innerHeight)
      media.style.transform = `scale(1.06) translateY(${sy * 0.2}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero">
      <div className="hero-media" ref={mediaRef}>
        <Image
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=2400&q=80"
          alt="Athlète en mouvement"
          fill
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      </div>
      <div className="hero-vignette" />
      <div className="hero-inner">
        <p className="eyebrow">Maillots officiels — Livraison 48H</p>
        <h1 className="hero-title">NEED<br />SPORT</h1>
        <a href="#shop" className="btn btn--primary">Explorer →</a>
      </div>
    </section>
  )
}
```

- [ ] Dans `app/globals.css`, **remplacer** les lignes 223 à 292 (section `.hero` + `.dial` + `.hero-scan` + `.hero-aurora` + `.hline` + `.hword`) par :

```css
.hero {
  position: relative;
  height: 100svh;
  min-height: 600px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  isolation: isolate;
  color: #FFFFFF;
  --text: #FFFFFF;
  --text-2: rgba(255,255,255,0.65);
}
.hero .btn--ghost { border-color: rgba(255,255,255,0.30); color: #FFFFFF; }
.hero .btn--ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(0,194,255,0.45); }

.hero-media {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}
.hero-media img {
  transition: transform 0.1s linear;
  will-change: transform;
}
.hero-vignette {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.08) 0%,
    rgba(0,0,0,0.1) 40%,
    rgba(0,0,0,0.65) 100%
  );
}
.hero-inner {
  width: 100%;
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 28px 80px;
  position: relative;
}
.hero-title {
  font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
  font-size: clamp(8rem, 18vw, 20rem);
  letter-spacing: -0.02em;
  line-height: 0.85;
  color: #fff;
  text-transform: uppercase;
  margin: 16px 0 40px;
}
.hero .eyebrow { display: inline-block; margin-bottom: 0; }
.hero .btn--primary { font-size: 0.9rem; padding: 14px 36px; }

@media (max-width: 768px) {
  .hero-inner { padding: 0 20px 60px; }
  .hero-title { font-size: clamp(5rem, 20vw, 8rem); margin-bottom: 32px; }
}
```

Note : Supprimer aussi les lignes des media queries existantes qui référencent `.hero h1`, `.hero-sub`, `.hero-ctas`, `.hword` dans la section `@media (max-width: 768px)` vers la ligne 530-534.

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Ouvrir http://localhost:3003 — le titre "NEED / SPORT" doit occuper ~80% de la largeur. Le parallax fonctionne au scroll.

- [ ] Commit :
```bash
git add components/Hero.tsx app/globals.css
git commit -m "feat: hero mega-typo — suppression radar/aurora/dial/word-reveal"
```

---

## Task 3 — EditorialTiles : nouveau composant

**Files:**
- Create: `components/EditorialTiles.tsx`

- [ ] Créer `components/EditorialTiles.tsx` :

```tsx
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
          src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1200&q=80"
          category="Clubs"
          label="Les Grands Clubs"
        />
        <Tile
          href="/collections/nations"
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
          category="Nations"
          label="Les Sélections"
        />
      </div>
    </section>
  )
}
```

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Commit :
```bash
git add components/EditorialTiles.tsx
git commit -m "feat: composant EditorialTiles deux dalles 80vh style Nike"
```

---

## Task 4 — page.tsx : câbler EditorialTiles

**Files:**
- Modify: `app/page.tsx`

- [ ] Remplacer `app/page.tsx` par :

```tsx
import Nav              from '@/components/Nav'
import Hero             from '@/components/Hero'
import EditorialTiles   from '@/components/EditorialTiles'
import Marquee          from '@/components/Marquee'
import PitchSection     from '@/components/PitchSection'
import ShopSection      from '@/components/ShopSection'
import ImmersiveSection from '@/components/ImmersiveSection'
import Footer           from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <EditorialTiles />
      <Marquee />
      <PitchSection />
      <ShopSection />
      <ImmersiveSection />
      <Footer />
    </>
  )
}
```

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Ouvrir http://localhost:3003 — après le hero, deux dalles photo plein-écran apparaissent avant le marquee.

- [ ] Commit :
```bash
git add app/page.tsx
git commit -m "feat: home — FeaturedDrop remplacé par EditorialTiles"
```

---

## Task 5 — ShopSection : featured card + hover overlay VOIR

**Files:**
- Modify: `components/ShopSection.tsx`
- Modify: `app/globals.css`

- [ ] Dans `app/globals.css`, modifier la ligne `.shop-media` — changer `aspect-ratio: 1` en `aspect-ratio: 3/4` :

```css
/* Avant */
.shop-media { aspect-ratio: 1; position: relative; overflow: hidden; background: linear-gradient(180deg, #EAE7E3, #D6D0C8); }

/* Après */
.shop-media { aspect-ratio: 3/4; position: relative; overflow: hidden; background: linear-gradient(180deg, #EAE7E3, #D6D0C8); }
```

- [ ] Dans `app/globals.css`, modifier `.shop-card` pour supprimer `box-shadow` et `border` au repos :

```css
/* Avant */
.shop-card {
  background: #FFFFFF; border: 1px solid rgba(0,0,0,0.07);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03);
  border-radius: var(--r-card); overflow: hidden; position: relative; transition: transform 350ms var(--ease), box-shadow 350ms var(--ease), border-color 300ms var(--ease);
}

/* Après */
.shop-card {
  background: #FFFFFF;
  border-radius: var(--r-card);
  overflow: hidden;
  position: relative;
  transition: transform 350ms var(--ease);
}
```

- [ ] Dans `app/globals.css`, modifier `.shop-card:hover` pour supprimer `box-shadow` et `border-color` :

```css
/* Avant */
.shop-card:hover { border-color: var(--border-hover); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05); }

/* Après */
.shop-card:hover { transform: translateY(-2px); }
```

- [ ] Dans `components/ShopSection.tsx`, dans le composant `ShopCard`, ajouter `<div className="shop-card-overlay" aria-hidden="true"><span>VOIR</span></div>` à l'intérieur du `<Link className="shop-media">`, après le `<Image>` :

```tsx
<Link href={`/products/${product.id}`} className="shop-media" tabIndex={-1} aria-hidden="true">
  <Image
    src={product.img}
    alt={`${product.club} — ${product.name}`}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    loading="lazy"
    style={{ objectFit: 'cover' }}
  />
  <div className="shop-card-overlay" aria-hidden="true"><span>VOIR</span></div>
</Link>
```

- [ ] Dans `components/ShopSection.tsx`, modifier la fonction `ShopSection` pour extraire la carte featured et afficher le reste en grille :

```tsx
export default function ShopSection() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible = activeFilter === 'all'
    ? CATALOG
    : CATALOG.filter((p) => p.cat.includes(activeFilter))

  const [featured, ...rest] = visible

  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <div className="sec-head">
          <div className="left">
            <span className="caption caption--accent">Shop</span>
            <h2>Le catalogue</h2>
          </div>
          <div className="right">
            <a href="#" data-cursor>Tous les filtres <span className="arr">→</span></a>
          </div>
        </div>

        <div className="filters" role="tablist" aria-label="Filtrer la collection">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className="filter"
              data-cursor
              aria-pressed={activeFilter === key}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {featured && (
          <Link href={`/products/${featured.id}`} className="shop-featured">
            <div className="shop-featured-media">
              <Image
                src={featured.img}
                alt={`${featured.club} — ${featured.name}`}
                fill
                sizes="100vw"
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="shop-featured-overlay" />
            <div className="shop-card-overlay" aria-hidden="true"><span>VOIR</span></div>
            <div className="shop-featured-info">
              <p className="eyebrow">{featured.club}</p>
              <h3 className="shop-featured-name">{featured.name}</h3>
              <p className="shop-featured-price">{featured.price}</p>
            </div>
          </Link>
        )}

        <div className="shop-grid">
          {rest.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Vérifier en navigateur : carte featured 21:9 pleine largeur → overlay "VOIR" au hover. Cartes 3:4 portrait en dessous → overlay "VOIR" au hover.

- [ ] Commit :
```bash
git add components/ShopSection.tsx app/globals.css
git commit -m "feat: shop featured card 21:9 + overlay VOIR + cartes portrait 3:4"
```

---

## Task 6 — Footer : signature Bebas

**Files:**
- Modify: `components/Footer.tsx`

- [ ] Remplacer **intégralement** `components/Footer.tsx` par :

```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-signature">NEED SPORT</div>

        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="brand-mark" />
              NEED SPORT
            </div>
            <p>
              Les maillots officiels des plus grands clubs et nations du monde.
              Coupes authentiques, tissus certifiés, livraison sous 48h en France métropolitaine.
            </p>
            <div className="socials">
              <a href="#" className="soc" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="soc" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/>
                  <path d="M14 4c.5 2.5 2.5 4.5 5 5"/>
                </svg>
              </a>
              <a href="#" className="soc" aria-label="X">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l16 16M20 4 4 20"/>
                </svg>
              </a>
              <a href="#" className="soc" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="6" width="18" height="12" rx="3"/>
                  <path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h5>Navigation</h5>
            <ul>
              <li><a href="/#shop">Shop</a></li>
              <li><Link href="/collections/clubs">Clubs</Link></li>
              <li><Link href="/collections/nations">Nations</Link></li>
              <li><Link href="/collections/limited">Édition limitée</Link></li>
              <li><Link href="/about">Notre histoire</Link></li>
            </ul>
          </div>

          <div>
            <h5>Service client</h5>
            <ul>
              <li><a href="#">Livraison &amp; retours</a></li>
              <li><a href="#">Guide des tailles</a></li>
              <li><a href="#">Authenticité</a></li>
              <li><a href="#">Nous contacter</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="copy">© 2026 NEED SPORT · Conçu à Paris</div>
      </div>
    </footer>
  )
}
```

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Vérifier en navigateur : "NEED SPORT" en très grand Bebas en haut du footer, séparé par une ligne du reste.

- [ ] Commit :
```bash
git add components/Footer.tsx
git commit -m "feat: footer signature Bebas oversized"
```

---

## Task 7 — ImmersiveSection : HUD stats monospace

**Files:**
- Modify: `components/ImmersiveSection.tsx`

- [ ] Dans `components/ImmersiveSection.tsx`, remplacer les trois `<div className="bio ...">` par :

```tsx
<div className="hud-stats" aria-hidden="true">
  <div className="hud-stat">
    <span className="hud-label">VITESSE PIC</span>
    <span className="hud-value">34.2 KM/H</span>
  </div>
  <div className="hud-stat">
    <span className="hud-label">TISSU</span>
    <span className="hud-value">DRYFIT PRO</span>
  </div>
  <div className="hud-stat">
    <span className="hud-label">CERTIFIÉ</span>
    <span className="hud-value">FIFA</span>
  </div>
</div>
```

- [ ] Vérifier `npx tsc --noEmit` — 0 erreur

- [ ] Vérifier en navigateur : stats en bas-droite de la section immersive, style monospace discret.

- [ ] Commit :
```bash
git add components/ImmersiveSection.tsx
git commit -m "feat: immersive HUD stats monospace style EMOTION BEYOND TECHNOLOGY"
```

---

## Task 8 — Vérification finale

**Files:** lecture seule

- [ ] `npx tsc --noEmit` — sortie vide (0 erreur TypeScript)

- [ ] Ouvrir http://localhost:3003 — checklist spec complète :
  - [ ] Hero : titre "NEED / SPORT" occupe ≥ 80% largeur viewport à 1440px
  - [ ] Deux dalles Editorial Tiles visibles sans scroll desktop
  - [ ] Shop : carte featured 21:9 pleine largeur avant la grille
  - [ ] Overlay "VOIR" au hover sur toutes les cartes shop
  - [ ] Section Pitch : fond `#0A0A0B`, titre "LE TERRAIN" oversized
  - [ ] HUD stats en coin bas-droite de l'Immersive
  - [ ] Signature "NEED SPORT" Bebas en haut du footer
  - [ ] Nav frosted blanc au scroll

- [ ] Commit final :
```bash
git add -A
git commit -m "feat: redesign visuel complet — Nike-editorial white"
```
