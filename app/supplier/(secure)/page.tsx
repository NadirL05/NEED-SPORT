'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  activeProducts: number
  lowStock: number
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

export default function SupplierDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supplier/stats')
      .then(r => r.json() as Promise<Stats>)
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: 4, margin: '4px 0 0' }}>
          Vue d&apos;ensemble de votre activité sur NeedFoot.
        </p>
      </motion.header>

      {/* Low-stock alert */}
      {!loading && stats && stats.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="alert"
          style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
            <path d="M8 2L14.5 13H1.5L8 2z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 6.5v3M8 11.25h.01" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400E' }}>
            <strong>{stats.lowStock} produit{stats.lowStock > 1 ? 's' : ''}</strong> avec un stock critique.{' '}
            <Link href="/supplier/products" style={{ color: '#92400E', fontWeight: 600, textDecoration: 'underline' }}>
              Mettre à jour
            </Link>
          </p>
        </motion.div>
      )}

      {/* KPI cards */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 12,
                height: 108,
                border: '1px solid #E5E7EB',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : stats ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <motion.div variants={fadeUp}>
            <KpiCard
              label="Chiffre d'affaires"
              value={`${(stats.totalRevenue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
              sub="sur toutes les commandes"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label="Commandes totales"
              value={String(stats.totalOrders)}
              sub={`dont ${stats.pendingOrders} en attente`}
              accent={stats.pendingOrders > 0 ? 'blue' : undefined}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label="Produits actifs"
              value={String(stats.activeProducts)}
              sub="dans votre catalogue"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <KpiCard
              label="Stock bas"
              value={String(stats.lowStock)}
              sub="à réapprovisionner"
              accent={stats.lowStock > 0 ? 'amber' : undefined}
            />
          </motion.div>
        </motion.div>
      ) : (
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Impossible de charger les données.</p>
      )}

      {/* Quick actions */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 12 }}
      >
        Accès rapide
      </motion.h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ ...container, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.32 } } }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}
      >
        <motion.div variants={fadeUp}>
          <ActionCard
            href="/supplier/orders"
            title="Gérer les commandes"
            desc="Consultez vos commandes, les détails d'expédition et le statut de paiement."
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 7h7M5.5 10.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ActionCard
            href="/supplier/products"
            title="Mettre à jour les stocks"
            desc="Ajustez les quantités disponibles de chaque produit de votre catalogue."
            iconBg="#ECFDF5"
            iconColor="#059669"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 1.5L16 5.5v7L9 16.5 2 12.5v-7L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 1.5v15M2 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            }
          />
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: 'blue' | 'amber'
}) {
  const accentStyles = {
    blue:  { border: '#BFDBFE', value: '#1E40AF' },
    amber: { border: '#FCD34D', value: '#D97706' },
  }
  const ac = accent ? accentStyles[accent] : null

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        border: `1px solid ${ac ? ac.border : '#E5E7EB'}`,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '0.775rem', color: '#6B7280', fontWeight: 500, marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: ac ? ac.value : '#111827',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 8 }}>{sub}</div>
    </div>
  )
}

function ActionCard({
  href,
  title,
  desc,
  icon,
  iconBg,
  iconColor,
}: {
  href: string
  title: string
  desc: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}) {
  return (
    <a
      href={href}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px',
        textDecoration: 'none',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = '#D1D5DB'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#E5E7EB'
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem', marginBottom: 6 }}>{title}</div>
        <div style={{ color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.55 }}>{desc}</div>
      </div>
      <div style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 500 }}>Accéder →</div>
    </a>
  )
}
