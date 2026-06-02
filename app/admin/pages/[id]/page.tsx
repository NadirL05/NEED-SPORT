import { notFound } from 'next/navigation'
import { getPage } from '@/lib/db/queries'
import PageForm from '../PageForm'

export const dynamic = 'force-dynamic'

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPage(id)
  if (!page) notFound()

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '28px' }}>Modifier — {page.title}</h1>
      <PageForm page={page} />
    </div>
  )
}
