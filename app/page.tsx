import Nav              from '@/components/Nav'
import Hero             from '@/components/Hero'
import EditorialTiles   from '@/components/EditorialTiles'
import Marquee          from '@/components/Marquee'
import PitchSection     from '@/components/PitchSection'
import ShopSection      from '@/components/ShopSection'
import ImmersiveSection from '@/components/ImmersiveSection'
import Reviews          from '@/components/Reviews'
import UGCSection       from '@/components/UGCSection'
import Footer           from '@/components/Footer'
import RevealObserver   from '@/components/RevealObserver'
import { getProducts, getProduct } from '@/lib/db/queries'

export default async function Home() {
  const [products, franceJersey] = await Promise.all([
    getProducts(),
    getProduct('france-home-2026'),
  ])

  return (
    <>
      <Nav />
      <Hero />
      <EditorialTiles />
      <Marquee />
      <PitchSection />
      <ShopSection products={products} />
      <ImmersiveSection product={franceJersey} />
      <Reviews />
      <UGCSection />
      <Footer />
      <RevealObserver />
    </>
  )
}
