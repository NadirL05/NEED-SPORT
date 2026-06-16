'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from './toast-store'
import type { ToastType } from './toast-store'

const STYLE: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },
  error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 7l1.75 1.75L9.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconError() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4.5v3M7 9.25h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6.5v4M7 4.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function SupplierToast() {
  const { toasts, remove } = useToastStore()

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => {
          const s = STYLE[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onClick={() => remove(t.id)}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.text,
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 240,
                maxWidth: 360,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                pointerEvents: 'all',
                userSelect: 'none',
              }}
            >
              {t.type === 'success' && <IconCheck />}
              {t.type === 'error' && <IconError />}
              {t.type === 'info' && <IconInfo />}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={e => { e.stopPropagation(); remove(t.id) }}
                aria-label="Fermer la notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  opacity: 0.5,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
