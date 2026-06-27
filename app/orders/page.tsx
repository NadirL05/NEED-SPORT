import { Metadata } from 'next'
import OrderSearch from './OrderSearch'

export const metadata: Metadata = {
  title: 'Suivi de commande — NEEDFOOT.',
  description: 'Suivez l\'état de votre commande NEEDFOOT. en entrant votre référence et votre email.',
}

export default function OrdersPage() {
  return <OrderSearch />
}
