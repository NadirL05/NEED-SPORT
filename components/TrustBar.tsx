const ITEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    label: 'Authenticité certifiée',
    desc: 'Chaque maillot est 100% officiel',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    label: 'Livraison 10–15 jours',
    desc: 'Livraison disponible partout, suivi inclus',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    label: 'Paiement sécurisé',
    desc: '3D Secure · Visa · Mastercard · PayPal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
      </svg>
    ),
    label: 'Retours sous 14 jours',
    desc: 'Hors articles personnalisés',
  },
]

export default function TrustBar() {
  return (
    <section className="trust-bar">
      <div className="trust-bar-grid">
        {ITEMS.map((item) => (
          <div key={item.label} className="trust-item">
            <span className="trust-icon">{item.icon}</span>
            <span className="trust-label">{item.label}</span>
            <span className="trust-desc">{item.desc}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
