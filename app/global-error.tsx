'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', gap: '16px' }}>
        <p style={{ color: '#555' }}>Une erreur inattendue s&apos;est produite.</p>
        <button onClick={reset} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
          Réessayer
        </button>
      </body>
    </html>
  )
}
