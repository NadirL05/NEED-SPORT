import Nav         from '@/components/Nav'
import ShopSection from '@/components/ShopSection'
import Footer      from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'
import { getProducts } from '@/lib/db/queries'

export const metadata = {
  title: 'Shop — Maillots de foot officiels | NEEDFOOT.',
  description: 'Tous nos maillots de football officiels. Clubs, sélections nationales et éditions limitées. Livraison suivie 10–15 jours.',
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '80px' }}>
        <ShopSection products={products} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  )
}
