import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATALOG } from '@/lib/catalog'
import CollectionClient from './CollectionClient'

const CAT_META: Record<string, { label: string; description: string }> = {
  clubs:   { label: 'Clubs',           description: 'Maillots officiels des plus grands clubs professionnels.' },
  nations: { label: 'Nations',         description: 'Maillots des équipes nationales pour la Coupe du Monde 2026.' },
  limited: { label: 'Édition Limitée', description: 'Drops exclusifs et éditions collectors en quantités limitées.' },
  vintage: { label: 'Vintage',         description: 'Collection rétro — les classiques qui traversent le temps.' },
}

type Props = { params: Promise<{ cat: string }> }

export function generateStaticParams() {
  return Object.keys(CAT_META).map((cat) => ({ cat }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params
  const meta = CAT_META[cat]
  if (!meta) return {}
  return {
    title: `${meta.label} — NEED SPORT`,
    description: meta.description,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { cat } = await params
  if (!CAT_META[cat]) notFound()
  const products = CATALOG.filter((p) => p.cat.includes(cat))
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
