'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        el.classList.add('revealed')
      })
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    )

    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}
