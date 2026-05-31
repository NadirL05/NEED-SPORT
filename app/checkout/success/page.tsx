import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commande confirmée — NEED SPORT',
}

export default function SuccessPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'grid', placeItems: 'center', fontSize: '1.8rem', margin: '0 auto 28px', boxShadow: '0 0 40px var(--accent-glow)' }}>
          ✓
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: 16 }}>
          Dans le sac.
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 36 }}>
          Ta commande est confirmée. Tu recevras un e-mail de confirmation sous peu.
          Livraison sous 48h en France métropolitaine.
        </p>
        <Link href="/" className="btn btn--primary">
          Retour à la boutique
        </Link>
      </div>
    </main>
  )
}
