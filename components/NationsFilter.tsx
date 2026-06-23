'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Continent = 'europe' | 'amerique' | 'afrique' | 'asie'

type Nation = {
  code: string
  name: string
  color: string
  continent: Continent
  img: string | null
}

const CONTINENTS: { key: Continent | 'all'; label: string }[] = [
  { key: 'all',      label: 'Tous' },
  { key: 'europe',   label: 'Europe' },
  { key: 'amerique', label: 'Amériques' },
  { key: 'afrique',  label: 'Afrique' },
  { key: 'asie',     label: 'Asie' },
]

export default function NationsFilter({ nations }: { nations: Nation[] }) {
  const [active, setActive] = useState<Continent | 'all'>('all')

  const visible = active === 'all' ? nations : nations.filter((n) => n.continent === active)

  return (
    <>
      <div className="wrap">
        <div className="nations-continents" role="tablist" aria-label="Filtrer par continent">
          {CONTINENTS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              className={`nations-cont-btn${active === key ? ' active' : ''}`}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="nations-scroll" role="list" aria-label="Équipes nationales">
        {visible.map((n) => (
          <Link
            key={n.code}
            href="/collections/nations"
            className="nation-card reveal"
            role="listitem"
            style={{ '--nation-color': n.color } as React.CSSProperties}
          >
            <div className="nation-img-wrap">
              {n.img ? (
                <Image
                  src={n.img}
                  alt={n.name}
                  fill
                  sizes="190px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="nation-img-placeholder" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span>Ajouter une image</span>
                </div>
              )}
            </div>
            <span className="nation-name">{n.name}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
