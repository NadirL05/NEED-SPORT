'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  activeProducts: number
  lowStock: number
}

const KPI_COLOR = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function SupplierDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supplier/stats')
      .then(r => r.json() as Promise<Stats>)
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: 'Chiffre d\'affaires', value: `${(stats.totalRevenue / 100).toFixed(2)} €`, sub: 'commandes payées' },
    { label: 'Commandes totales',   value: stats.totalOrders,    sub: `${stats.pendingOrders} en attente` },
    { label: 'Produits actifs',     value: stats.activeProducts, sub: `${stats.lowStock} stock bas` },
  ] : []

  return (
    <div>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 36 }}>Vue d&apos;ensemble de votre activité sur NEED SPORT.</p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[1,2,3].map(i => <div key={i} style={skeletonStyle} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 48 }}>
          {kpis.map((k, i) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${KPI_COLOR[i]}` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <QuickLink href="/supplier/orders" title="Voir les commandes" desc="Consultez vos commandes et les détails d'expédition." icon="◎" color="#3b82f6" />
        <QuickLink href="/supplier/products" title="Gérer mes produits" desc="Mettez à jour les stocks de votre catalogue." icon="◈" color="#10b981" />
      </div>
    </div>
  )
}

function QuickLink({ href, title, desc, icon, color }: { href: string; title: string; desc: string; icon: string; color: string }) {
  return (
    <a href={href} style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', textDecoration: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'block', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{desc}</div>
    </a>
  )
}

const skeletonStyle: React.CSSProperties = {
  background: '#e2e8f0', borderRadius: 14, height: 110,
  animation: 'pulse 1.5s ease-in-out infinite',
}
