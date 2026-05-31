import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATALOG } from '@/lib/catalog'
import ProductClient from './ProductClient'

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return CATALOG.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = CATALOG.find((p) => p.id === id)
  if (!product) return {}
  return {
    title: `${product.club} — ${product.name} | NEED SPORT`,
    description: `Maillot officiel ${product.club} ${product.name}. ${product.price}. Coupe authentique. Livraison 48 h en France métropolitaine.`,
    openGraph: {
      images: [{ url: product.img, width: 700, height: 700, alt: `${product.club} — ${product.name}` }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = CATALOG.find((p) => p.id === id)
  if (!product) notFound()
  return <ProductClient product={product} />
}
