import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FAQ & Aide — NEEDSPORT.',
  description:
    'Livraison, retours, guide des tailles, authenticité, paiement et contact. Toutes les réponses pour votre commande NEEDSPORT.',
}

const SIZES: [string, string, string][] = [
  ['S', '92–98', '69'],
  ['M', '98–104', '71'],
  ['L', '104–110', '73'],
  ['XL', '110–118', '75'],
  ['XXL', '118–126', '77'],
]

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main className="info-page">
        <div className="wrap">
          <p className="info-kicker">Aide</p>
          <h1 className="info-title">FAQ &amp; informations</h1>
          <p className="info-lead">
            Tout ce qu&apos;il faut savoir avant et après votre commande. Une autre
            question&nbsp;? Écrivez-nous, on répond vite.
          </p>

          <section id="livraison" className="info-section">
            <h2>Livraison</h2>
            <p>
              Expédition sous 24–48h. Réception en <strong>48 à 72h</strong> en France
              métropolitaine, 3 à 6 jours en Europe. <strong>Livraison offerte dès 60&nbsp;€.</strong>{' '}
              Un numéro de suivi vous est envoyé par e-mail dès l&apos;expédition.
            </p>
          </section>

          <section id="retours" className="info-section">
            <h2>Retours &amp; échanges</h2>
            <p>
              Vous disposez de <strong>30 jours</strong> pour retourner un article non porté,
              étiquettes attachées. L&apos;<strong>échange de taille est gratuit</strong>. Les
              articles personnalisés (flocage nom/numéro) ne sont ni repris ni échangés.
            </p>
          </section>

          <section id="tailles" className="info-section">
            <h2>Guide des tailles</h2>
            <p>Mesures en centimètres. Entre deux tailles, choisissez la plus grande.</p>
            <table className="info-table">
              <thead>
                <tr><th>Taille</th><th>Poitrine</th><th>Longueur</th></tr>
              </thead>
              <tbody>
                {SIZES.map(([s, chest, len]) => (
                  <tr key={s}><td>{s}</td><td>{chest}</td><td>{len}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="info-note">Coupe standard adulte · mesures indicatives (±2 cm).</p>
          </section>

          <section id="authenticite" className="info-section">
            <h2>Authenticité &amp; qualité</h2>
            <p>
              Tissu thermorégulant, coutures renforcées et finitions conformes aux modèles
              officiels. Chaque pièce est contrôlée à la main avant expédition.
            </p>
          </section>

          <section id="paiement" className="info-section">
            <h2>Paiement sécurisé</h2>
            <p>
              Paiement 100% sécurisé via <strong>Stripe</strong>&nbsp;: carte bancaire,
              Apple&nbsp;Pay et Google&nbsp;Pay. Vos données bancaires ne transitent jamais par
              nos serveurs.
            </p>
          </section>

          <section id="contact" className="info-section">
            <h2>Nous contacter</h2>
            <p>
              Une question sur une commande ou un produit&nbsp;? Utilisez notre{' '}
              <Link href="/contact">formulaire de contact</Link> ou écrivez-nous à{' '}
              <a href="mailto:contact@needsport.fr">contact@needsport.fr</a> — réponse sous 24h
              ouvrées.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
