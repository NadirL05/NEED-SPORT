import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from './db/schema'
import {
  type ProductOptions,
  normalizeOptions,
  unitPriceCents,
  optionsKey,
  isVintageCat,
} from './pricing'

export interface CartItem extends Product {
  quantity: number
  size?: string
  options: ProductOptions
  /** Stable line identity: product + size + configured options. */
  key: string
}

interface AddConfig {
  size?: string
  options?: Partial<ProductOptions>
}

interface CartStore {
  items: CartItem[]
  total: number
  lastAdded: string | null
  addItem: (product: Product, config?: AddConfig) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
}

function lineKey(id: string, size: string | undefined, options: ProductOptions): string {
  return `${id}__${size ?? ''}__${optionsKey(options)}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      lastAdded: null,

      addItem: (product, config) =>
        set((state) => {
          const options = normalizeOptions(config?.options)
          const size    = config?.size
          const key     = lineKey(product.id, size, options)
          const unit    = unitPriceCents(options, isVintageCat(product.cat))

          const existing = state.items.find((i) => i.key === key)
          const items = existing
            ? state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [
                ...state.items,
                // Override the inherited product price with the configured unit
                // price, so every `item.priceEur` read reflects the real charge.
                { ...product, priceEur: unit, quantity: 1, size, options, key },
              ]
          return {
            items,
            total: state.total + 1,
            lastAdded: `${product.club} — ${product.name}`,
          }
        }),

      removeItem: (key) =>
        set((state) => {
          const removed = state.items.find((i) => i.key === key)
          return {
            items: state.items.filter((i) => i.key !== key),
            total: Math.max(0, state.total - (removed?.quantity ?? 0)),
            lastAdded: null,
          }
        }),

      updateQuantity: (key, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const removed = state.items.find((i) => i.key === key)
            return {
              items: state.items.filter((i) => i.key !== key),
              total: Math.max(0, state.total - (removed?.quantity ?? 0)),
              lastAdded: null,
            }
          }
          const prev  = state.items.find((i) => i.key === key)
          const delta = quantity - (prev?.quantity ?? 0)
          return {
            items: state.items.map((i) =>
              i.key === key ? { ...i, quantity } : i
            ),
            total: Math.max(0, state.total + delta),
            lastAdded: null,
          }
        }),

      clearCart: () => set({ items: [], total: 0, lastAdded: null }),
    }),
    { name: 'needsport-cart' }
  )
)
