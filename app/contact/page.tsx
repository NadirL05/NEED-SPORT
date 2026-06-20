import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact — NEEDSPORT.',
  description:
    "Une question sur une commande, une taille ou une personnalisation ? Contactez l'équipe NEEDSPORT, réponse sous 24h ouvrées.",
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="info-page">
        <div className="wrap contact-wrap">
          <p className="info-kicker">Contact</p>
          <h1 className="info-title">On vous répond.</h1>
          <p className="info-lead">
            Une question sur une commande, une taille ou une personnalisation&nbsp;? Écrivez-nous —
            réponse sous 24h ouvrées, du lundi au vendredi.
          </p>

          <div className="contact-grid">
            <ContactForm />

            <aside className="contact-aside">
              <div className="contact-aside-block">
                <h2>Par e-mail</h2>
                <p><a href="mailto:contact@needsport.fr">contact@needsport.fr</a></p>
              </div>
              <div className="contact-aside-block">
                <h2>Réponses immédiates</h2>
                <p>
                  Livraison, retours, délais, personnalisation, tailles et authenticité&nbsp;: la plupart des réponses sont
                  déjà dans la <Link href="/faq">FAQ</Link>.
                </p>
              </div>
              <div className="contact-aside-block">
                <h2>Délai de réponse</h2>
                <p>Sous 24h ouvrées (lun–ven). Les commandes restent prioritaires.</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
