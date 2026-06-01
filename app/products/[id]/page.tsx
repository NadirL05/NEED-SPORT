import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/db/queries'
import ProductClient from './ProductClient'

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return {}
  return {
    title: `${product.club} ${product.name} | MAILLO.`,
    description: `Achetez le maillot officiel ${product.name} de ${product.club}. Livraison express. Édition Coupe du Monde 2026.`,
    openGraph: {
      title: `${product.club} ${product.name} | MAILLO.`,
      description: `Maillot ${product.club} disponible sur MAILLO. — NEED SPORT`,
      images: product.img ? [{ url: product.img }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()
  return <ProductClient product={product} />
}
