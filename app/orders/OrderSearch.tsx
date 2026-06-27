'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  productName: string
  size: string | null
  quantity: number
  priceEur: number
}

interface Order {
  id: string
  status: 'paid' | 'shipped' | 'delivered'
  totalEur: number
  originalTotalEur: number | null
  promoCode: string | null
  discountEur: number | null
  customerName: string | null
  shippingAddress: string | null
  createdAt: string
  items: OrderItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type StatusKey = Order['status']

const STATUS_LABELS: Record<StatusKey, string> = {
  paid: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
}

const STATUS_CLASSES: Record<StatusKey, string> = {
  paid: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  shipped: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

function StatusBadge({ status }: { status: StatusKey }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${STATUS_CLASSES[status]}`}
    >
      {status === 'delivered' && (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Order detail ─────────────────────────────────────────────────────────────

function OrderDetail({ order, onReset }: { order: Order; onReset: () => void }) {
  const hasDiscount =
    order.promoCode != null &&
    order.discountEur != null &&
    order.discountEur > 0 &&
    order.originalTotalEur != null

  const shortRef = `#${order.id.slice(0, 12)}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 px-6 py-5 flex items-center justify-between">
        <span className="text-white text-xl font-extrabold tracking-tight">NEEDFOOT.</span>
        <span className="text-gray-400 text-xs font-mono">{shortRef}</span>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-4">

          {/* Status card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Statut</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-400 text-right leading-relaxed">
              Commandé le<br />
              <span className="text-gray-600 font-medium">
                {order.createdAt ? formatDate(order.createdAt) : '—'}
              </span>
            </p>
          </div>

          {/* Items card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-7">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Articles</p>
            </div>

            <ul className="divide-y divide-gray-50 px-6 sm:px-8">
              {order.items.map((item, idx) => {
                const label = item.size ? `${item.productName} — ${item.size}` : item.productName
                const lineTotal = item.priceEur * item.quantity

                return (
                  <li key={idx} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPrice(item.priceEur)} × {item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(lineTotal)}</p>
                  </li>
                )
              })}
            </ul>

            {/* Totals */}
            <div className="mx-6 sm:mx-8 mt-2 mb-6 pt-4 border-t border-gray-100 space-y-2">
              {hasDiscount && order.originalTotalEur != null && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.originalTotalEur)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Remise ({order.promoCode})</span>
                    <span>−{formatPrice(order.discountEur!)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total</span>
                <span>{formatPrice(order.totalEur)}</span>
              </div>
            </div>
          </div>

          {/* Shipping card */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 sm:px-8 sm:py-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Adresse de livraison
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          )}

          {/* Footer note + back link */}
          <p className="text-center text-xs text-gray-400 pb-2">
            Délais : préparation 3–4 jours, puis livraison 10–15 jours.
          </p>
          <div className="text-center pb-4">
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
            >
              Suivre une autre commande
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Search form ──────────────────────────────────────────────────────────────

function errorMessage(status: number, fallback: string): string {
  if (status === 404) return 'Commande introuvable. Vérifiez la référence.'
  if (status === 401) return 'Email non reconnu pour cette commande.'
  if (status === 429) return 'Trop de tentatives. Réessayez dans quelques minutes.'
  return fallback || 'Une erreur est survenue. Contactez-nous.'
}

function SearchForm({ onFound }: { onFound: (order: Order) => void }) {
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(ref.trim())}?email=${encodeURIComponent(email)}`,
      )
      const json = await res.json()

      if (!res.ok) {
        setError(errorMessage(res.status, json.error ?? ''))
        return
      }

      onFound(json.order as Order)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 px-6 py-5">
        <span className="text-white text-xl font-extrabold tracking-tight">NEEDFOOT.</span>
      </header>

      {/* Card */}
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Suivi de commande</h1>
                <p className="text-sm text-gray-400">Entrez votre référence et votre email</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-6 sm:mx-8" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-8 space-y-4">
            <div>
              <label
                htmlFor="order-ref"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2"
              >
                Référence de commande
              </label>
              <input
                id="order-ref"
                type="text"
                required
                autoComplete="off"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="ord_xxxxxxxxxx…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="order-email"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2"
              >
                Adresse email
              </label>
              <input
                id="order-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3"
                role="alert"
              >
                <svg
                  className="h-4 w-4 text-red-500 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Recherche en cours…
                </span>
              ) : (
                'Suivre ma commande →'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function OrderSearch() {
  const [order, setOrder] = useState<Order | null>(null)

  if (order) {
    return <OrderDetail order={order} onReset={() => setOrder(null)} />
  }

  return <SearchForm onFound={setOrder} />
}
