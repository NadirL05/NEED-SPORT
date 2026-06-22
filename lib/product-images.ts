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

export function parseImgs(raw: string | null | undefined): string[] {
  if (!raw) return []
  if (raw.trimStart().startsWith('[')) {
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr.filter((u) => typeof u === 'string' && u.length > 0)
    } catch {
      // fall through to single-url treatment
    }
  }
  return [raw]
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
  const filtered = imgs.filter((u) => u.trim().length > 0)
  if (filtered.length === 0) return ''
  if (filtered.length === 1) return filtered[0]
  return JSON.stringify(filtered)
}
