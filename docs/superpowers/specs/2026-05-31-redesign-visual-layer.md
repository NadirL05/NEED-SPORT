# NEED SPORT — Redesign couche visuelle
**Date** : 2026-05-31  
**Scope** : Couche visuelle uniquement (CSS, composants React). Architecture technique conservée (Next.js, catalog, Zustand, Stripe).  
**Inspiration** : Nike.fr, Nova Carbon, MUFC., SŌM State Of Mind, EMOTION BEYOND TECHNOLOGY (refs dans `/NEED SPORT copie/`)  
**Contrainte** : Fond blanc (`#FAFAF9`) — décision associés.

---

## 1. Direction artistique

### ADN extrait des références
- **Photographie = l'interface** — pas de fond décoratif, la photo est le contenu
- **Typographie à l'échelle du stade** — Bebas Neue à des tailles qui débordent de l'écran
- **Fond blanc avec un seul dark** — le Pitch est le seul `#0A0A0B` du site, contrepoint éditorial
- **Zéro chrome UI** — pas de border-radius visible, pas de shadow au repos, pas de décorations
- **HUD minimaliste** — overlays de données techniques (vitesse, certification, PMS) sur photos
- **Hover = révélation** — les cartes sont opaques au repos, le contenu se révèle au survol

### Palette tokens (mise à jour)
```css
:root {
  --void:         #FAFAF9;   /* fond global blanc chaud */
  --void-2:       #F2F1F0;   /* footer, sections secondaires */
  --pitch:        #0A0A0B;   /* section Pitch uniquement */
  --text:         #0C0A09;   /* texte primaire */
  --text-2:       #6B6368;   /* texte secondaire */
  --text-3:       #A09B97;   /* captions, timestamps */
  --accent:       #00C2FF;   /* cyan électrique — CTAs, badge */
  --accent-glow:  rgba(0,194,255,0.35);
  --border:       rgba(0,0,0,0.08);
  --ease:         cubic-bezier(0.2, 0.7, 0.2, 1);
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Typographie
| Rôle | Font | Taille | Notes |
|---|---|---|---|
| Hero title | Bebas Neue | `clamp(8rem, 18vw, 20rem)` | Déborde de l'écran, tracking 0 |
| Section heads | Bebas Neue | `clamp(4rem, 10vw, 14rem)` | Uppercase, line-height 0.85 |
| Tile labels | Bebas Neue | `clamp(3rem, 6vw, 7rem)` | Sur les editorial tiles |
| Body | DM Sans 300 | `1rem` | line-height 1.55 |
| Eyebrows | DM Sans 300 | `0.72rem` | Uppercase, tracking 0.22em |

---

## 2. Sections — spécification détaillée

### 2.1 Nav
- Transparente au top (texte `--text` sur fond blanc, pas de bg)
- Au scroll : `background: rgba(250,250,249,0.92)`, `backdrop-filter: blur(20px)`, border-bottom `rgba(0,0,0,0.08)`
- Pas de changement structurel — garder les liens, mega-menu, panier existants
- **Fichier** : `components/Nav.tsx` + `app/globals.css` section `.nav`

### 2.2 Hero — refonte complète
**Avant** : fond noir avec radar SVG animé, titre moyen  
**Après** :
- Full viewport `100svh`
- `<img>` Unsplash plein-écran en `object-fit: cover`, overlay `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))`
- Titre **"NEED SPORT"** en Bebas `clamp(8rem, 18vw, 20rem)`, blanc, `letter-spacing: -0.02em`, `line-height: 0.85` — s'étale quasi sur toute la largeur
- Eyebrow "MAILLOTS OFFICIELS — LIVRAISON 48H" au-dessus
- Un seul CTA pill : "EXPLORER →"
- Supprimer : radar SVG, badge "100% AUTHENTIQUE", tous les éléments décoratifs
- **Fichier** : `components/Hero.tsx`

### 2.3 Editorial Tiles — section nouvelle (remplace FeaturedDrop)
**Structure** :
- Deux dalles côte à côte, chacune `height: 80vh`
- Chaque dalle = photo Unsplash en `object-fit: cover` + overlay gradient bas
- Sur la dalle : eyebrow catégorie + titre Bebas grand + CTA pill blanc
- **Dalles par défaut** : CLUBS (photo stade) / NATIONS (photo sélection)
- Hover : légère montée `scale(1.02)` sur l'image, overlay s'intensifie légèrement
- Mobile : stack vertical, chaque dalle `70vh`
- **Fichier** : nouveau composant `components/EditorialTiles.tsx`

### 2.4 Shop Section — refonte de la grille
**Avant** : grille 3 colonnes uniforme avec shadow  
**Après** :
- Fond `#FAFAF9`
- **Carte featured** : première carte pleine largeur, photo `aspect-ratio: 16/9`, titre produit Bebas `clamp(2.5rem, 5vw, 5rem)`, prix. Uniquement le premier produit du catalogue filtré.
- **Grille** : 4 colonnes desktop, 2 tablette, 1 mobile
- **Carte standard** : photo `aspect-ratio: 3/4` (portrait jersey), club en eyebrow, nom en Bebas `1.8rem`, prix. Zéro shadow, zéro border visible au repos.
- **Hover** : overlay sombre `rgba(0,0,0,0.45)` monte en opacity 0→1 avec "VOIR" centré en blanc Bebas
- **Filtres** : pills agrandis (padding `10px 22px`), active = fond `#0C0A09` / texte blanc
- **Fichier** : `components/ShopSection.tsx`

### 2.5 Pitch Section — conserver + nettoyer
- Fond `#0A0A0B`, texte blanc — seule section dark du site
- Titre "LE TERRAIN" monte à `clamp(5rem, 12vw, 14rem)`
- Retirer `var(--void)` hardcodé en `#0A0A0B` dans le gradient (déjà fait)
- Pas d'autre changement structurel
- **Fichier** : `components/PitchSection.tsx` + CSS scoped

### 2.6 Immersive Section — ajout overlays HUD
**Avant** : photo stade + titre + CTA  
**Après** : même base + overlays HUD inspirés de "EMOTION BEYOND TECHNOLOGY" :
- Stats en coin bas-droite : VITESSE PIC `34.2 KM/H`, TISSU `DRYFIT PRO`, CERTIFIÉ `FIFA`
- Style monospaced 0.65rem, blanc à 70% d'opacité
- Séparateur `|` entre stats
- **Fichier** : `components/ImmersiveSection.tsx`

### 2.7 Footer — refonte typographique
**Avant** : colonnes neutres  
**Après** :
- Fond `#F2F1F0`
- Signature **"NEED SPORT"** en Bebas `clamp(4rem, 10vw, 10rem)` en haut du footer, texte `#0C0A09`
- Colonnes nav en dessous, DM Sans 300
- Bas de page : copyright centré, texte `--text-3`
- **Fichier** : `components/Footer.tsx`

---

## 3. CSS global — changements dans `globals.css`

### Suppressions
- `.card` avec `box-shadow` (remplacé par hover overlay)
- `.product-img-wrap` background gradient (les vraies photos Unsplash s'en chargent)
- `.pitch-bg::after` gradient `var(--void)` → garder `#0A0A0B` (déjà corrigé)

### Ajouts
```css
/* Editorial tile */
.editorial-tile { position: relative; overflow: hidden; }
.editorial-tile img { transition: transform 600ms var(--ease-out); }
.editorial-tile:hover img { transform: scale(1.03); }

/* Shop card hover overlay */
.shop-card-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  opacity: 0; transition: opacity 350ms var(--ease);
  display: grid; place-items: center;
}
.shop-card:hover .shop-card-overlay { opacity: 1; }

/* HUD stats */
.hud-stats { font-variant-numeric: tabular-nums; letter-spacing: 0.08em; }
```

---

## 4. Composants à créer / modifier

| Composant | Action | Priorité |
|---|---|---|
| `Hero.tsx` | Refonte complète | P0 |
| `EditorialTiles.tsx` | Nouveau composant | P0 |
| `ShopSection.tsx` | Refonte grille + hover overlay | P0 |
| `Footer.tsx` | Ajout signature Bebas | P1 |
| `ImmersiveSection.tsx` | Ajout HUD stats | P1 |
| `PitchSection.tsx` | Scale typo seulement | P2 |
| `globals.css` | Tokens, editorial tile, hover overlay | P0 |

---

## 5. Ce qui NE change PAS

- Routes Next.js (`/products/[id]`, `/cart`, `/checkout`, `/collections/[cat]`)
- `lib/catalog.ts` — catalogue produits
- `lib/store.ts` — Zustand cart
- `lib/stripe.ts` — Stripe integration
- `app/api/` — routes API checkout + webhook
- `app/layout.tsx` — fonts, metadata
- Pages intérieures (`ProductClient`, `CartClient`, `CollectionClient`) — hors scope

---

## 6. Critères de succès

- [ ] Hero : titre occupe ≥ 80% de la largeur viewport sur desktop 1440px
- [ ] Editorial Tiles : deux dalles visibles sans scroll sur desktop
- [ ] Shop grid : carte featured pleine largeur, grille 4 colonnes en dessous
- [ ] Hover overlay sur toutes les cartes shop
- [ ] Pitch reste dark, toutes les autres sections sont sur fond blanc/crème
- [ ] HUD stats visibles sur la section Immersive
- [ ] Signature Bebas visible dans le footer
- [ ] 0 erreur TypeScript (`npx tsc --noEmit`)
- [ ] Nav frosted au scroll
