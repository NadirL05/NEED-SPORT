// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for storefront pricing.
// Imported by the configurator UI (display) AND the checkout API (charge),
// so the customer is always charged exactly what they see.
//
// Grid (TTC, in cents):
//                    Maillot seul     Ensemble (maillot + short)
//   Version Fan        24,99 €              44,99 €
//   Version Player     35,99 €              55,99 €
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

// Flat prices that ignore the Fan/Player version.
export const VINTAGE_PRICE_CENTS      = 3599 // 35,99 € (catégorie Vintage)
export const SHORT_TSHIRT_PRICE_CENTS = 4999 // 49,99 € (format short + t-shirt)

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

/** Base price (cents) before add-ons.
 *  fanBase = product.priceEur from DB (fan jersey price).
 *  Other tiers are calculated as deltas from the fan jersey hardcoded reference.
 */
export function basePriceCents(o: ProductOptions, isVintage = false, fanBase?: number): number {
  if (isVintage)                return fanBase ?? VINTAGE_PRICE_CENTS
  if (o.kit === 'short_tshirt') return SHORT_TSHIRT_PRICE_CENTS
  const ref   = BASE_PRICE_CENTS.fan.jersey                  // 2499
  const delta = BASE_PRICE_CENTS[o.version][o.kit] - ref     // 0 / +1100 / +2000 / +3100
  return (fanBase ?? ref) + delta
}

/** Unit price (cents) for a fully-resolved set of options. */
export function unitPriceCents(o: ProductOptions, isVintage = false, fanBase?: number): number {
  let cents = basePriceCents(o, isVintage, fanBase)
  if (o.flocage)            cents += FLOCAGE_CENTS
  if (o.patch !== 'none')   cents += PATCH_CENTS
  if (o.emballage)          cents += EMBALLAGE_CENTS
  return cents
}

/** Price for a specific version/kit relative to the product's DB price. */
export function versionPrice(version: Version, kit: GridKit, fanBase: number): number {
  const delta = BASE_PRICE_CENTS[version][kit] - BASE_PRICE_CENTS.fan.jersey
  return fanBase + delta
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

const EUR_FORMATTER = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function formatEur(cents: number): string {
  return EUR_FORMATTER.format(cents / 100)
}
