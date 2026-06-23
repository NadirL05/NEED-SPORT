import Nav             from '@/components/Nav'
import Hero            from '@/components/Hero'
import ProductRail     from '@/components/ProductRail'
import TrustBar        from '@/components/TrustBar'
import Footer          from '@/components/Footer'
import RevealObserver  from '@/components/RevealObserver'
import { getProducts } from '@/lib/db/queries'
import { resolveMediaSlots } from '@/lib/media-slots'

// The homepage is statically prerendered, but its hero media can be replaced by
// admins at any time. Revalidate hourly so the new visual appears without a
// redeploy; admin updates also call revalidatePath('/') for an immediate refresh.
export const revalidate = 3600

export default async function Home() {
  const [bestsellingClubs, bestsellingNations, limited, media] = await Promise.all([
    getProducts('clubs'),
    getProducts('nations'),
    getProducts('limited'),
    resolveMediaSlots(),
  ])

  return (
    <>
      <Nav />
      <Hero imageSrc={media['home.hero']} />
      <ProductRail
        title="Meilleures Ventes"
        subtitle="Les maillots les plus demandés"
        products={bestsellingClubs}
        nationProducts={bestsellingNations}
        viewAllHref="/collections/clubs"
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
