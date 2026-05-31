const ITEMS = [
  { label: 'Nouveau drop', muted: false },
  { label: 'France 2026',  muted: true  },
  { label: 'Édition limitée', muted: false },
  { label: 'Authentic',    muted: true  },
  { label: 'Livraison 48h', muted: false },
  { label: 'Heritage 90',  muted: true  },
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className={`m-item${item.muted ? ' muted' : ''}`}>
            {item.label} <i className="m-dot">●</i>
          </span>
        ))}
      </div>
    </div>
  )
}
