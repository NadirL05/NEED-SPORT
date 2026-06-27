import type { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = {
  title: 'Panier — NeedFoot',
  description: 'Vérifiez votre sélection et finalisez votre commande.',
}

export default function CartPage() {
  return <CartClient />
}
