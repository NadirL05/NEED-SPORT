import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin-page-guard'
import { getPages } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function AdminPagesPage() {
  await requireAdminPage()

  const pages = await getPages()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Pages</h1>
        <Link
          href="/admin/pages/new"
          style={{ padding: '10px 20px', background: '#0a0a0b', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
        >
          + Nouvelle page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>Aucune page créée.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e4e4e7' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#555' }}>Slug</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#555' }}>Titre</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#555' }}>Statut</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#555' }}>URL publique</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>
                  <code style={{ fontSize: '0.82rem', background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px' }}>{p.id}</code>
                </td>
                <td style={{ padding: '12px', fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600,
                    background: p.published ? '#dcfce7' : '#f4f4f5',
                    color:      p.published ? '#16a34a' : '#888',
                  }}>
                    {p.published ? 'Publiée' : 'Brouillon'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {p.published && (
                    <a href={`/p/${p.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.82rem' }}>
                      /p/{p.id}
                    </a>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <Link
                    href={`/admin/pages/${p.id}`}
                    style={{ padding: '6px 14px', background: '#f4f4f5', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none', color: '#333' }}
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
