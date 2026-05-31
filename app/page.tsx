import Nav              from '@/components/Nav'
import Hero             from '@/components/Hero'
import Marquee          from '@/components/Marquee'
import FeaturedDrop     from '@/components/FeaturedDrop'
import PitchSection     from '@/components/PitchSection'
import ShopSection      from '@/components/ShopSection'
import ImmersiveSection from '@/components/ImmersiveSection'
import Footer           from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <FeaturedDrop />
      <Marquee />
      <PitchSection />
      <ShopSection />
      <ImmersiveSection />
      <Footer />
    </>
  )
}
