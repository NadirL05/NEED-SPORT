'use client'

import { useEffect, useLayoutEffect } from 'react'

export default function RevealObserver() {
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        el.classList.add('revealed')
      })
      return
    }
    const vh = window.innerHeight
    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
      const { top, bottom } = el.getBoundingClientRect()
      if (top < vh && bottom > 0) el.classList.add('revealed')
    })
    document.body.classList.add('reveal-active')
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

    document.querySelectorAll<HTMLElement>('.reveal:not(.revealed)').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}
