const items = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2Z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    label: 'Authenticité garantie',
    desc: 'Tous nos maillots sont 100 % officiels, issus des canaux de distribution agréés.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    label: 'Paiement sécurisé',
    desc: 'Chiffrement SSL, Stripe certifié PCI-DSS. Vos données ne transitent jamais en clair.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M5 8h14M5 8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
        <path d="m12 14 1.5 1.5L16 13"/>
      </svg>
    ),
    label: 'Livraison 48h',
    desc: 'Expédition le jour même avant 14h. Suivi en temps réel inclus.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'Support 7j/7',
    desc: 'Une équipe passionnée répond en moins de 2h par chat, email ou téléphone.',
  },
]

export default function TrustBar() {
  return (
    <section className="trust-bar">
      <div className="trust-bar-grid">
        {items.map((item) => (
          <div key={item.label} className="trust-item">
            <div className="trust-icon">{item.icon}</div>
            <span className="trust-label">{item.label}</span>
            <p className="trust-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
