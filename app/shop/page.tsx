import Nav         from '@/components/Nav'
import ShopSection from '@/components/ShopSection'
import Footer      from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'
import { getProducts } from '@/lib/db/queries'

export const metadata = {
  title: 'Shop — Maillots de foot officiels | MAILLO.',
  description: 'Tous nos maillots de football officiels. Clubs, sélections nationales et éditions limitées. Livraison express.',
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '80px', background: '#0A0A0B' }}>
        <ShopSection products={products} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  )
}
