import PageForm from '../PageForm'
import { requireAdminPage } from '@/lib/admin-page-guard'

export default async function NewPagePage() {
  await requireAdminPage()

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '28px' }}>Nouvelle page</h1>
      <PageForm />
    </div>
  )
}
