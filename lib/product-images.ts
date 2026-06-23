/**
 * Multi-image helpers for the `img` column.
 *
 * Storage format (no DB migration needed):
 *   - Legacy single image : `"https://..."`          → backward-compatible
 *   - Multiple images     : `'["https://…","https://…"]'`
 *
 * All display code should call `parseImgs` so it handles both formats.
 * Save code should call `serializeImgs` which keeps a plain string when there
 * is only one image (preserves full backward-compatibility with the codebase).
 */

export const MAX_PRODUCT_IMAGES = 4

function isValidProductImageReference(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) {
    return !/[\\\u0000-\u001f\u007f]/.test(value)
  }

  try {
    const url = new URL(value)
    return (
      (url.protocol === 'https:' || url.protocol === 'http:')
      && url.username === ''
      && url.password === ''
    )
  } catch {
    return false
  }
}

function readStoredImages(raw: string): { images?: string[]; malformed?: true } {
  const stored = raw.trim()
  if (!stored) return { images: [] }

  if (!stored.startsWith('[')) return { images: [stored] }

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return { malformed: true }
    if (parsed.some((value) => typeof value !== 'string')) return { malformed: true }
    return { images: parsed as string[] }
  } catch {
    return { malformed: true }
  }
}

export function parseImgs(raw: string | null | undefined): string[] {
  if (!raw) return []
  const result = readStoredImages(raw)
  if (!result.images) return []
  return result.images
    .map((url) => url.trim())
    .filter(isValidProductImageReference)
    .slice(0, MAX_PRODUCT_IMAGES)
}

/** First image, used as the cover / thumbnail everywhere. */
export function primaryImg(raw: string | null | undefined): string {
  return parseImgs(raw)[0] ?? ''
}

/**
 * Serialize the array back for the DB.
 * Single image → plain URL (unchanged from before, nothing breaks).
 * Multiple images → JSON array string.
 */
export function serializeImgs(imgs: string[]): string {
  const filtered = imgs.map((url) => url.trim()).filter((url) => url.length > 0)
  if (filtered.length === 0) return ''
  if (filtered.length === 1) return filtered[0]
  return JSON.stringify(filtered)
}

/** Returns a user-facing reason when a stored image payload cannot be saved. */
export function getProductImageValidationError(raw: string): string | null {
  const result = readStoredImages(raw)
  if (result.malformed || !result.images) return 'Format des photos invalide.'

  const images = result.images.map((url) => url.trim())
  if (images.length === 0) return 'Ajoutez au moins une photo.'
  if (images.length > MAX_PRODUCT_IMAGES) return '4 photos maximum sont autorisées.'
  if (images.some((url) => !isValidProductImageReference(url))) {
    return 'URL de photo invalide.'
  }
  if (new Set(images).size !== images.length) return 'Une photo est présente en doublon.'

  return null
}

export interface ProductRevalidationTarget {
  path: string
  type?: 'page' | 'layout'
}

/** Storefront pages whose rendered product data can become stale after a mutation. */
export function productRevalidationTargets(productId: string): ProductRevalidationTarget[] {
  return [
    { path: '/' },
    { path: '/shop' },
    { path: '/collections/[cat]', type: 'page' },
    { path: `/products/${encodeURIComponent(productId)}` },
    { path: '/admin/products' },
  ]
}
