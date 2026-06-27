import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Page introuvable — NeedFoot',
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 28px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(8rem, 20vw, 18rem)',
              color: 'var(--accent)',
              lineHeight: 1,
              marginBottom: 0,
            }}
          >
            404
          </p>
          <h1
            className="display"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: 16 }}
          >
            Page introuvable.
          </h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 36 }}>
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/" className="btn btn--primary">
            Retour à la boutique →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
