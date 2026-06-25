'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Une erreur est survenue</h2>
          <button onClick={reset} style={{ marginTop: '1rem' }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
