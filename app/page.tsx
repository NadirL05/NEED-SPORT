import Nav             from '@/components/Nav'
import Hero            from '@/components/Hero'
import Marquee         from '@/components/Marquee'
import EditorialTiles  from '@/components/EditorialTiles'
import ProductRail     from '@/components/ProductRail'
import NationsCarousel from '@/components/NationsCarousel'
import FeaturedSplit   from '@/components/FeaturedSplit'
import TrustBar        from '@/components/TrustBar'
import Footer          from '@/components/Footer'
import RevealObserver  from '@/components/RevealObserver'
import { getProducts, getProduct } from '@/lib/db/queries'
import { resolveMediaSlots } from '@/lib/media-slots'

// The homepage is statically prerendered, but the Nations carousel reads images
// from Blob storage that admins can change at any time. Revalidate hourly so
// new nation images appear even without a redeploy, while keeping Blob `list()`
// calls (an "advanced operation") well within the free tier. Admin uploads and
// deletes also call revalidatePath('/') for an immediate refresh.
export const revalidate = 3600

export default async function Home() {
  const [allProducts, limited, featured, media] = await Promise.all([
    getProducts(),
    getProducts('limited'),
    getProduct('france-home-2026'),
    resolveMediaSlots(),
  ])

  return (
    <>
      <Nav />
      <Hero imageSrc={media['home.hero']} />
      <ProductRail
        title="Meilleures Ventes"
        subtitle="Les maillots les plus demandés"
        products={allProducts.filter((p) => !p.cat.includes('limited'))}
        viewAllHref="/shop"
      />
      <NationsCarousel />
      <Marquee />
      <FeaturedSplit product={featured} />
      <EditorialTiles
        clubsImage={media['home.editorial.clubs']}
        nationsImage={media['home.editorial.nations']}
      />
      <ProductRail
        title="Éditions Limitées"
        kicker="Quantités limitées · Drops exclusifs"
        products={limited}
        viewAllHref="/collections/limited"
      />
      <TrustBar />
      <Footer />
      <RevealObserver />
    </>
  )
}
