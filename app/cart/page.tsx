import type { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = {
  title: 'Panier — NEED SPORT',
  description: 'Vérifiez votre sélection et finalisez votre commande.',
}

export default function CartPage() {
  return <CartClient />
}
