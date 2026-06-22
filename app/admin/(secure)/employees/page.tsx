import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { employees } from '@/lib/db/schema'
import { verifyAdminSessionToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export default async function AdminEmployeesPage() {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  const valid = token ? await verifyAdminSessionToken(token) : false
  if (!valid) redirect('/admin/login')

  const rows = await db.select({
    id:        employees.id,
    email:     employees.email,
    name:      employees.name,
    active:    employees.active,
    createdAt: employees.createdAt,
  }).from(employees).orderBy(employees.createdAt)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Employés</h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.88rem' }}>{rows.length} compte{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/employees/new"
          style={{ padding: '10px 20px', background: '#0a0a0b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
        >
          + Nouvel employé
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e4e4e7' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e4e4e7', background: '#fafafa' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Nom</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#555' }}>Statut</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{emp.name}</td>
                <td style={{ padding: '12px 16px', color: '#666' }}>{emp.email}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600,
                    background: emp.active ? '#dcfce7' : '#fee2e2',
                    color: emp.active ? '#166534' : '#991b1b',
                  }}>
                    {emp.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.82rem' }}>
                  {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
            Aucun employé. <Link href="/admin/employees/new" style={{ color: '#0a0a0b' }}>Créez le premier.</Link>
          </div>
        )}
      </div>
    </div>
  )
}
