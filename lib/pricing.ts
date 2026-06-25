// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for storefront pricing.
// Imported by the configurator UI (display) AND the checkout API (charge),
// so the customer is always charged exactly what they see.
//
// The product's administered `priceEur` is the Fan + jersey base price.
// Configuration choices add deterministic supplements to that base:
//   Version Player ........................ +11,00 €
//   Ensemble (maillot + short) ............. +20,00 €
//   Short + t-shirt ........................ +25,00 €
//
//   + Flocage (nom + numéro) ............... +5,00 €
//   + Patch (CDM / Ligue / LDC) ............ +2,00 €
//   + Emballage cadeau ..................... +6,99 €
// ─────────────────────────────────────────────────────────────────────────────

export type Version = 'fan' | 'player'
export type GridKit = 'jersey' | 'set'
export type Kit     = GridKit | 'short_tshirt'
export type Patch   = 'none' | 'cdm' | 'ligue' | 'ldc'

export interface ProductOptions {
  version:   Version
  kit:       Kit
  flocage:   boolean
  patch:     Patch
  emballage: boolean
}

export const BASE_PRICE_CENTS: Record<Version, Record<GridKit, number>> = {
  fan:    { jersey: 2499, set: 4499 },
  player: { jersey: 3599, set: 5599 },
}

export const PLAYER_SURCHARGE_CENTS      = 1100
export const SET_SURCHARGE_CENTS         = 2000
export const SHORT_TSHIRT_SURCHARGE_CENTS = 2500

// Legacy catalog constants kept temporarily for import compatibility. New
// storefront code must use each product's administered `priceEur` instead.
export const VINTAGE_PRICE_CENTS       = 3599
export const SHORT_TSHIRT_PRICE_CENTS  = 4999

export const FLOCAGE_CENTS   = 500
export const PATCH_CENTS     = 200
export const EMBALLAGE_CENTS = 699

/** Lowest possible price — used for "À partir de …" on listings. */
export const FROM_PRICE_CENTS = BASE_PRICE_CENTS.fan.jersey // 2499

export const DEFAULT_OPTIONS: ProductOptions = {
  version: 'fan', kit: 'jersey', flocage: false, patch: 'none', emballage: false,
}

export const VERSION_LABEL: Record<Version, string> = {
  fan: 'Fan', player: 'Player',
}
export const KIT_LABEL: Record<Kit, string> = {
  jersey: 'Maillot seul', set: 'Ensemble (maillot + short)', short_tshirt: 'Short + t-shirt',
}
export const PATCH_LABEL: Record<Patch, string> = {
  none: 'Sans patch', cdm: 'Coupe du Monde', ligue: 'Ligue 1', ldc: 'Ligue des Champions',
}

const isVersion = (v: unknown): v is Version => v === 'fan' || v === 'player'
const isKit     = (v: unknown): v is Kit     => v === 'jersey' || v === 'set' || v === 'short_tshirt'
const isPatch   = (v: unknown): v is Patch   =>
  v === 'none' || v === 'cdm' || v === 'ligue' || v === 'ldc'

/** Coerce an untrusted/partial options object into a valid, complete one. */
export function normalizeOptions(o?: Partial<ProductOptions> | null): ProductOptions {
  return {
    version:   isVersion(o?.version) ? o!.version : DEFAULT_OPTIONS.version,
    kit:       isKit(o?.kit)         ? o!.kit     : DEFAULT_OPTIONS.kit,
    flocage:   Boolean(o?.flocage),
    patch:     isPatch(o?.patch)     ? o!.patch   : DEFAULT_OPTIONS.patch,
    emballage: Boolean(o?.emballage),
  }
}

/** Whether a product (by its categories) is priced as Vintage. */
export function isVintageCat(cat?: string[] | null): boolean {
  return Array.isArray(cat) && cat.includes('vintage')
}

/** Configured price before optional flocage, patch, and gift wrapping. */
export function basePriceCents(
  productBasePriceCents: number,
  o: ProductOptions,
  isVintage = false,
): number {
  if (!Number.isSafeInteger(productBasePriceCents) || productBasePriceCents <= 0) {
    throw new RangeError('Product base price must be a positive integer in cents.')
  }
  if (isVintage) return productBasePriceCents

  return productBasePriceCents
    + (o.version === 'player' && o.kit !== 'short_tshirt' ? PLAYER_SURCHARGE_CENTS : 0)
    + (o.kit === 'short_tshirt' ? SHORT_TSHIRT_SURCHARGE_CENTS : 0)
    + (o.kit === 'set' ? SET_SURCHARGE_CENTS : 0)
}

/** Unit price (cents) for a fully-resolved set of options. */
export function unitPriceCents(
  productBasePriceCents: number,
  o: ProductOptions,
  isVintage = false,
): number {
  let cents = basePriceCents(productBasePriceCents, o, isVintage)
  if (o.flocage)            cents += FLOCAGE_CENTS
  if (o.patch !== 'none')   cents += PATCH_CENTS
  if (o.emballage)          cents += EMBALLAGE_CENTS
  return cents
}

/** Stable identity string for a configured line (size handled separately). */
export function optionsKey(o: ProductOptions): string {
  return `${o.version}-${o.kit}-${o.flocage ? 'f1' : 'f0'}-${o.patch}-${o.emballage ? 'e1' : 'e0'}`
}

/** Human-readable one-line summary, e.g. "Player · Ensemble · Flocage · Patch LDC". */
export function optionsSummary(o: ProductOptions, isVintage = false): string {
  const parts: string[] = []
  if (isVintage)                     parts.push('Vintage')
  else if (o.kit === 'short_tshirt') parts.push('Short + t-shirt')
  else                               parts.push(VERSION_LABEL[o.version], o.kit === 'set' ? 'Ensemble' : 'Maillot')
  if (o.flocage)          parts.push('Flocage')
  if (o.patch !== 'none') parts.push(`Patch ${PATCH_LABEL[o.patch]}`)
  if (o.emballage)        parts.push('Emballage cadeau')
  return parts.join(' · ')
}

export function formatEur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
