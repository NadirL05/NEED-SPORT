import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage, getPublishedPages } from '@/lib/db/queries'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await getPublishedPages()
  return pages.map((p) => ({ slug: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page || !page.published) return {}

  const title       = page.seoTitle       ?? `${page.title} | MAILLO.`
  const description = page.seoDescription ?? undefined

  return {
    title,
    description,
    openGraph: { title, description },
  }
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page || !page.published) notFound()

  return (
    <>
      <Nav />
      <main style={{ minHeight: '60vh' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: '32px' }}>
            {page.title}
          </h1>
          <div style={{ lineHeight: 1.75, color: '#444', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {page.content}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
