import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-ghost" aria-hidden="true">NEEDSPORT.</div>
      <div className="wrap">
        <div className="footer-signature">NEED SPORT</div>

        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="brand-mark" />
              NEED SPORT
            </div>
            <p>
              Les maillots officiels des plus grands clubs et nations du monde.
              Coupes authentiques, tissus certifiés, livraison partout en 10 à 15 jours après préparation.
            </p>
            <div className="socials">
              <a href="https://www.instagram.com/needsport.fr" target="_blank" rel="noopener noreferrer" className="soc" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@needsport.fr" target="_blank" rel="noopener noreferrer" className="soc" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/>
                  <path d="M14 4c.5 2.5 2.5 4.5 5 5"/>
                </svg>
              </a>
              <a href="https://x.com/needsport_fr" target="_blank" rel="noopener noreferrer" className="soc" aria-label="X">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l16 16M20 4 4 20"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@needsport" target="_blank" rel="noopener noreferrer" className="soc" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="6" width="18" height="12" rx="3"/>
                  <path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h5>Navigation</h5>
            <ul>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/collections/clubs">Clubs</Link></li>
              <li><Link href="/collections/nations">Nations</Link></li>
              <li><Link href="/collections/limited">Édition limitée</Link></li>
              <li><Link href="/about">Notre histoire</Link></li>
            </ul>
          </div>

          <div>
            <h5>Service client</h5>
            <ul>
              <li><Link href="/faq#livraison">Livraison &amp; retours</Link></li>
              <li><Link href="/faq#tailles">Guide des tailles</Link></li>
              <li><Link href="/faq#authenticite">Authenticité</Link></li>
              <li><Link href="/contact">Nous contacter</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="copy">© 2026 NEED SPORT</div>
      </div>
    </footer>
  )
}
