import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/db/queries'
import CollectionClient from './CollectionClient'

const CAT_META: Record<string, { label: string; description: string }> = {
  clubs:   { label: 'Clubs',           description: 'Maillots officiels des plus grands clubs professionnels.' },
  nations: { label: 'Nations',         description: 'Maillots des équipes nationales pour la Coupe du Monde 2026.' },
  limited: { label: 'Édition Limitée', description: 'Drops exclusifs et éditions collectors en quantités limitées.' },
  vintage: { label: 'Vintage',         description: 'Collection rétro — les classiques qui traversent le temps.' },
}

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ cat: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const meta = CAT_META[cat]
  if (!meta) return {}
  return {
    title: `Maillots ${meta.label} | NEEDFOOT.`,
    description: `Découvrez notre collection de maillots ${meta.label}. ${meta.description} Livraison rapide, éditions Coupe du Monde 2026.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { cat } = await params
  if (!CAT_META[cat]) notFound()
  const products = await getProducts(cat)
  const meta = CAT_META[cat]
  return (
    <CollectionClient
      cat={cat}
      label={meta.label}
      description={meta.description}
      products={products}
    />
  )
}
