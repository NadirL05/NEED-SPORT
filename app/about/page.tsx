import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Notre histoire — NEED SPORT',
  description:
    'NEED SPORT est né d\'une conviction : les vrais supporters méritent les vrais maillots.',
}

/* ─── Value cards data ─────────────────────────────────────── */
const VALUES = [
  {
    num: '01',
    name: 'Authenticité',
    desc: 'Uniquement des maillots officiels. Zéro réplique, zéro compromis.',
  },
  {
    num: '02',
    name: 'Passion',
    desc: 'Fondés par des supporters, pour des supporters. Le terrain d\'abord.',
  },
  {
    num: '03',
    name: 'Accessibilité',
    desc: 'Livraison rapide, retours faciles. Le maillot parfait sans la galère.',
  },
]

/* ─── About page ───────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        {/* ── SECTION 1 : Hero / Statement ───────────────────── */}
        <section
          style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: 120,
            paddingBottom: 80,
          }}
        >
          <div className="wrap">
            <span
              style={{
                display: 'block',
                fontSize: '.8rem',
                textTransform: 'uppercase',
                letterSpacing: '.2em',
                color: 'var(--accent)',
                marginBottom: 16,
              }}
            >
              Notre histoire
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
                fontSize: 'clamp(4rem,10vw,9rem)',
                lineHeight: 0.92,
                margin: '0 0 32px',
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                color: 'var(--text)',
              }}
            >
              Porte ce qu&apos;ils portent.
            </h1>

            <p
              style={{
                color: 'var(--text-2)',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              NEED SPORT est né d&apos;une conviction simple&nbsp;: les vrais
              supporters méritent les vrais maillots. Pas des répliques. Les
              originaux.
            </p>

            <div
              style={{
                marginTop: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: 40,
                  height: 1,
                  background: 'var(--accent)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: '.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.15em',
                  color: 'var(--text-2)',
                }}
              >
                Fondé à Paris&nbsp;· 2024
              </span>
            </div>
          </div>
        </section>

        {/* ── SECTION 2 : Mission ─────────────────────────────── */}
        <section
          style={{
            background: 'var(--surface)',
            padding: 'clamp(80px,10vw,140px) 0',
          }}
        >
          {/* Responsive grid handled via a scoped style tag */}
          <style>{`
            .about-mission-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 40px;
            }
            @media (max-width: 640px) {
              .about-mission-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="wrap">
            <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '.2em',
                  color: 'var(--accent)',
                  marginBottom: 8,
                }}
              >
                Notre mission
              </span>

              <p
                style={{
                  fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
                  fontSize: 'clamp(2.5rem,5vw,4rem)',
                  lineHeight: 1.1,
                  margin: '24px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em',
                  color: 'var(--text)',
                }}
              >
                Chaque maillot raconte une histoire. Nous rendons ces histoires
                accessibles.
              </p>

              <div className="about-mission-grid">
                <div
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-2)',
                    fontSize: '.95rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid var(--border)',
                    paddingTop: 24,
                  }}
                >
                  Plus de 40 fédérations · 200+ clubs · 12 nations en stock
                  permanent
                </div>
                <div
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-2)',
                    fontSize: '.95rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid var(--border)',
                    paddingTop: 24,
                  }}
                >
                  Livraison 48h · Retours 30 jours · Maillots 100% authentiques
                  certifiés
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3 : Values ──────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg)',
            padding: 'clamp(80px,10vw,140px) 0',
          }}
        >
          <style>{`
            .about-values-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              margin-top: 48px;
            }
            @media (max-width: 900px) {
              .about-values-grid {
                grid-template-columns: 1fr 1fr;
              }
            }
            @media (max-width: 560px) {
              .about-values-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="wrap">
            <span
              style={{
                display: 'block',
                fontSize: '.8rem',
                textTransform: 'uppercase',
                letterSpacing: '.2em',
                color: 'var(--accent)',
                marginBottom: 12,
              }}
            >
              Ce qui nous guide
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
                fontSize: 'clamp(2.2rem,4vw,3rem)',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                color: 'var(--text)',
              }}
            >
              Nos valeurs
            </h2>

            <div className="about-values-grid">
              {VALUES.map((v) => (
                <div
                  key={v.num}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--accent)',
                    padding: 32,
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        'var(--font-bebas), "Bebas Neue", sans-serif',
                      fontSize: '3rem',
                      lineHeight: 1,
                      color: 'var(--accent)',
                      opacity: 0.3,
                      marginBottom: 16,
                    }}
                    aria-hidden="true"
                  >
                    {v.num}
                  </div>
                  <h3
                    style={{
                      fontFamily:
                        'var(--font-bebas), "Bebas Neue", sans-serif',
                      fontSize: '1.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text)',
                      marginBottom: 12,
                    }}
                  >
                    {v.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm), ui-sans-serif, sans-serif',
                      fontSize: '.9rem',
                      lineHeight: 1.65,
                      color: 'var(--text-2)',
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4 : CTA ─────────────────────────────────── */}
        <section
          style={{
            background: 'var(--surface)',
            padding: '120px 0',
            textAlign: 'center',
          }}
        >
          <div className="wrap">
            <h2
              style={{
                fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
                fontSize: 'clamp(3rem,7vw,6rem)',
                lineHeight: 0.92,
                textTransform: 'uppercase',
                letterSpacing: '0.01em',
                color: 'var(--text)',
                marginBottom: 40,
              }}
            >
              Prêt à porter leur maillot&nbsp;?
            </h2>
            <Link href="/#shop" className="btn btn--primary">
              Explorer la collection →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
