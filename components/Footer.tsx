import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="brand-mark" />
              NEED SPORT
            </div>
            <p>
              Les maillots officiels des plus grands clubs et nations du monde.
              Coupes authentiques, tissus certifiés, livraison sous 48h en France métropolitaine.
            </p>
            <div className="socials">
              <a href="#" className="soc" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>
              </a>
              <a href="#" className="soc" aria-label="TikTok">
                <svg viewBox="0 0 24 24"><path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.5 2.5 4.5 5 5"/></svg>
              </a>
              <a href="#" className="soc" aria-label="X">
                <svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20"/></svg>
              </a>
              <a href="#" className="soc" aria-label="YouTube">
                <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h5>Navigation</h5>
            <ul>
              <li><a href="/#shop">Shop</a></li>
              <li><Link href="/collections/clubs">Clubs</Link></li>
              <li><Link href="/collections/nations">Nations</Link></li>
              <li><Link href="/collections/limited">Édition limitée</Link></li>
              <li><Link href="/about">Notre histoire</Link></li>
            </ul>
          </div>

          <div>
            <h5>Service client</h5>
            <ul>
              <li><a href="#">Livraison &amp; retours</a></li>
              <li><a href="#">Guide des tailles</a></li>
              <li><a href="#">Authenticité</a></li>
              <li><a href="#">Nous contacter</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="copy">© 2026 NEED SPORT · Conçu à Paris</div>
      </div>
    </footer>
  )
}
