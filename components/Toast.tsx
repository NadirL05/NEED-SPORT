'use client'

import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/lib/store'

export default function Toast() {
  const lastAdded = useCartStore((s) => s.lastAdded)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!lastAdded) return
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(timerRef.current)
  }, [lastAdded])

  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
      <div className="ico">✓</div>
      <div className="meta">
        <div className="t">Dans le sac.</div>
        <div className="s">{lastAdded ?? 'Maillot ajouté au panier'}</div>
      </div>
    </div>
  )
}
