import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  remove: (id: string) => void
}

let _seq = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add(message, type = 'success') {
    const id = `t-${++_seq}`
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },
  remove(id) {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
  },
}))
