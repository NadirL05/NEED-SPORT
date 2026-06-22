'use client'

import { MotionConfig } from 'framer-motion'
import SupplierToast from './SupplierToast'
import type { ReactNode } from 'react'

export default function SupplierProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <SupplierToast />
    </MotionConfig>
  )
}
