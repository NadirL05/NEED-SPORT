'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const curRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cur  = curRef.current
    const ring = ringRef.current
    if (!cur || !ring) return

    let mx = -100, my = -100, rx = -100, ry = -100
    let rafId: number

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      cur.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
    }

    const tick = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      const hovered = ring.classList.contains('hover')
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${hovered ? 1 : 0.4})`
      rafId = requestAnimationFrame(tick)
    }

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest('[data-cursor], a, button')) ring.classList.add('hover')
    }

    const onOut = (e: PointerEvent) => {
      const rel = e.relatedTarget as Element | null
      if (!rel?.closest?.('[data-cursor], a, button')) ring.classList.remove('hover')
    }

    window.addEventListener('pointermove', onMove)
    document.body.addEventListener('pointerover', onOver)
    document.body.addEventListener('pointerout', onOut)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.body.removeEventListener('pointerover', onOver)
      document.body.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div className="cursor"      ref={curRef}  aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  )
}
