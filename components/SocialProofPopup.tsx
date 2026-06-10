'use client'

import { useEffect, useRef, useState } from 'react'

const REVIEWS = [
  { initials: 'TG', name: 'Thomas G.', city: 'Paris', stars: 5, text: 'Qualité incroyable, le flocage est parfait.', ago: '2 min' },
  { initials: 'RE', name: 'Rania E.', city: 'Lyon', stars: 5, text: 'Exactement comme sur les photos, très satisfaite.', ago: '8 min' },
  { initials: 'KB', name: 'Karim B.', city: 'Marseille', stars: 5, text: 'Fan de France, ce maillot est parfait pour la Coupe.', ago: '15 min' },
  { initials: 'MD', name: 'Mathys D.', city: 'Bordeaux', stars: 5, text: 'Le maillot est incroyable, livraison rapide !', ago: '22 min' },
  { initials: 'SC', name: 'Sarah C.', city: 'Toulouse', stars: 5, text: 'Super qualité, je recommande sans hésiter.', ago: '31 min' },
  { initials: 'NL', name: 'Nicolas L.', city: 'Nantes', stars: 5, text: 'Belle surprise sur la coupe et les finitions.', ago: '45 min' },
  { initials: 'AC', name: 'Alexis C.', city: 'Lille', stars: 5, text: 'Identique au maillot officiel, top rapport qualité prix.', ago: '1 h' },
]

type Review = (typeof REVIEWS)[0]

export default function SocialProofPopup() {
  const [current, setCurrent] = useState<Review | null>(null)
  const [visible, setVisible] = useState(false)
  const idxRef = useRef(Math.floor(Math.random() * REVIEWS.length))
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const show = () => {
      idxRef.current = (idxRef.current + 1) % REVIEWS.length
      setCurrent(REVIEWS[idxRef.current])
      setVisible(true)

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setVisible(false), 5000)
    }

    const first = setTimeout(show, 6000)
    const interval = setInterval(show, 14000)

    return () => {
      clearTimeout(first)
      clearInterval(interval)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  if (!current) return null

  return (
    <div
      className={`sp-popup${visible ? ' sp-popup--visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="sp-avatar" aria-hidden="true">{current.initials}</div>
      <div className="sp-body">
        <div className="sp-meta">
          <span className="sp-name">{current.name}</span>
          <span className="sp-city">{current.city}</span>
        </div>
        <div className="sp-stars" aria-label={`${current.stars} étoiles sur 5`}>
          {'★'.repeat(current.stars)}
        </div>
        <p className="sp-text">{current.text}</p>
        <span className="sp-time">Il y a {current.ago}</span>
      </div>
      <button className="sp-close" onClick={dismiss} aria-label="Fermer">×</button>
    </div>
  )
}
