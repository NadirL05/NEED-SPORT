'use client'

import { useEffect, useState } from 'react'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const KEY = 'needsport-promo-end'
    let stored = localStorage.getItem(KEY)
    let deadline: number

    if (stored) {
      deadline = Number(stored)
      if (deadline < Date.now()) {
        // Expired — reset to 24h
        deadline = Date.now() + 24 * 60 * 60 * 1000
        localStorage.setItem(KEY, String(deadline))
      }
    } else {
      deadline = Date.now() + 24 * 60 * 60 * 1000
      localStorage.setItem(KEY, String(deadline))
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    document.body.setAttribute('data-bar-open', '')
    setVisible(true)

    return () => clearInterval(id)
  }, [])

  const close = () => {
    setVisible(false)
    document.body.removeAttribute('data-bar-open')
  }

  if (!visible) return null

  return (
    <div className="announce-bar" role="banner" aria-label="Offre promotionnelle">
      <div className="announce-inner">
        <p className="announce-msg">
          Livraison disponible partout — Code{' '}
          <strong>NEEDSPORT26</strong>
          {' '}— Expire dans{' '}
          <span className="announce-timer" aria-live="off">
            {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
          </span>
        </p>
        <button className="announce-close" onClick={close} aria-label="Fermer l'annonce">
          ×
        </button>
      </div>
    </div>
  )
}
