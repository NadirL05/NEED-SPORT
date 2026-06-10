import Nav              from '@/components/Nav'
import Hero             from '@/components/Hero'
import EditorialTiles   from '@/components/EditorialTiles'
import NationsCarousel  from '@/components/NationsCarousel'
import Marquee          from '@/components/Marquee'
import PitchSection     from '@/components/PitchSection'
import ImmersiveSection from '@/components/ImmersiveSection'
import Reviews          from '@/components/Reviews'
import UGCSection       from '@/components/UGCSection'
import Footer           from '@/components/Footer'
import RevealObserver   from '@/components/RevealObserver'
import { getProduct } from '@/lib/db/queries'

export default async function Home() {
  const franceJersey = await getProduct('france-home-2026')

  return (
    <>
      <Nav />
      <Hero />
      <EditorialTiles />
      <NationsCarousel />
      <Marquee />
      <PitchSection />
      <ImmersiveSection product={franceJersey} />
      <Reviews />
      <UGCSection />
      <Footer />
      <RevealObserver />
    </>
  )
}
