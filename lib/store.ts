import { create } from 'zustand'
import type { Product } from './catalog'

export interface CartItem extends Product {
  quantity: number
  size?: string
}

interface CartStore {
  items: CartItem[]
  total: number
  lastAdded: string | null
  addItem: (product: Product, size?: string) => void
  removeItem: (id: string, size?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string) => void
  clearCart: () => void
}

const sameItem = (a: CartItem, id: string, size?: string) =>
  a.id === id && a.size === size

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,
  lastAdded: null,

  addItem: (product, size) =>
    set((state) => {
      const existing = state.items.find((i) => sameItem(i, product.id, size))
      const items = existing
        ? state.items.map((i) =>
            sameItem(i, product.id, size) ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { ...product, quantity: 1, size }]
      return {
        items,
        total: state.total + 1,
        lastAdded: `${product.club} — ${product.name}`,
      }
    }),

  removeItem: (id, size) =>
    set((state) => {
      const removed = state.items.find((i) => sameItem(i, id, size))
      return {
        items: state.items.filter((i) => !sameItem(i, id, size)),
        total: Math.max(0, state.total - (removed?.quantity ?? 0)),
        lastAdded: null,
      }
    }),

  updateQuantity: (id, quantity, size) =>
    set((state) => {
      if (quantity <= 0) {
        const removed = state.items.find((i) => sameItem(i, id, size))
        return {
          items: state.items.filter((i) => !sameItem(i, id, size)),
          total: Math.max(0, state.total - (removed?.quantity ?? 0)),
          lastAdded: null,
        }
      }
      const prev = state.items.find((i) => sameItem(i, id, size))
      const delta = quantity - (prev?.quantity ?? 0)
      return {
        items: state.items.map((i) =>
          sameItem(i, id, size) ? { ...i, quantity } : i
        ),
        total: Math.max(0, state.total + delta),
        lastAdded: null,
      }
    }),

  clearCart: () => set({ items: [], total: 0, lastAdded: null }),
}))
