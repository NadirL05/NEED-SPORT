import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/db/queries'
import ProductClient from './ProductClient'

type Props = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return {}

  const autoTitle = `${product.club} ${product.name} | MAILLO.`
  const autoDesc  = `Achetez le maillot officiel ${product.name} de ${product.club}. Livraison express. Édition Coupe du Monde 2026.`

  const title       = product.seoTitle       ?? autoTitle
  const description = product.seoDescription ?? autoDesc

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
