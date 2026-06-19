import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'
import EmployeeProductForm from '../EmployeeProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token || !(await verifyEmployeeToken(token))) redirect('/employee/login')

  const { id } = await params
  const [product] = await db.select().from(products).where(eq(products.id, id))
  if (!product) notFound()

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <Link href="/employee/products" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>← Retour au catalogue</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 0' }}>{product.name}</h1>
        <p style={{ color: '#888', fontSize: '0.85rem', margin: '2px 0 0' }}>{product.club}</p>
      </div>
      <EmployeeProductForm product={product} />
    </div>
  )
}
