import Nav             from '@/components/Nav'
import Hero            from '@/components/Hero'
import Marquee         from '@/components/Marquee'
import EditorialTiles  from '@/components/EditorialTiles'
import ProductRail     from '@/components/ProductRail'
import NationsCarousel from '@/components/NationsCarousel'
import FeaturedSplit   from '@/components/FeaturedSplit'
import TrustBar        from '@/components/TrustBar'
import Reviews         from '@/components/Reviews'
import Footer          from '@/components/Footer'
import RevealObserver  from '@/components/RevealObserver'
import { getProducts, getProduct } from '@/lib/db/queries'

export default async function Home() {
  const [bestsellers, limited, featured] = await Promise.all([
    getProducts('clubs'),
    getProducts('limited'),
    getProduct('france-home-2026'),
  ])

  return (
    <>
      <Nav />
      <Hero />
      <ProductRail
        title="Meilleures Ventes"
        subtitle="Les maillots les plus demandés"
        products={bestsellers}
      />
      <Marquee />
      <EditorialTiles />
      <NationsCarousel />
      <FeaturedSplit product={featured} />
      <ProductRail
        title="Éditions Limitées"
        kicker="Quantités limitées · Drops exclusifs"
        products={limited}
        viewAllHref="/collections/limited"
      />
      <TrustBar />
      <Reviews />
      <Footer />
      <RevealObserver />
    </>
  )
}
