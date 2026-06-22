import { put } from '@vercel/blob'

// Canonical MIME → extension allowlist. Both the stored extension and the
// Content-Type are derived from the validated MIME type, never from the
// attacker-controlled filename, so a spoofed or polyglot file cannot be served
// back as HTML/SVG/JS from the public blob store.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export interface UploadFailure { ok: false; error: string; status: number }
export interface UploadSuccess { ok: true; url: string }

export async function storeProductImage(
  file: File | null,
): Promise<UploadSuccess | UploadFailure> {
  if (!file) return { ok: false, error: 'Aucun fichier.', status: 400 }

  const ext = ALLOWED[file.type]
  if (!ext) {
    return { ok: false, error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou AVIF.', status: 400 }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'Fichier trop volumineux (10 Mo max).', status: 400 }
  }

  // Unpredictable path (no overwrite/enumeration) + canonical content-type.
  const name = `products/${crypto.randomUUID()}.${ext}`
  const blob = await put(name, file, {
    access:          'public',
    addRandomSuffix: false,
    contentType:     file.type,
  })
  return { ok: true, url: blob.url }
}
