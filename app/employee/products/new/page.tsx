import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyEmployeeToken, EMPLOYEE_COOKIE } from '@/lib/employee-auth'
import EmployeeProductForm from '../EmployeeProductForm'

export default async function NewProductPage() {
  const store = await cookies()
  const token = store.get(EMPLOYEE_COOKIE)?.value
  if (!token || !(await verifyEmployeeToken(token))) redirect('/employee/login')

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <Link href="/employee/products" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>← Retour au catalogue</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 0' }}>Nouveau produit</h1>
      </div>
      <EmployeeProductForm />
    </div>
  )
}
