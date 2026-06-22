'use client'

export default function EmployeeLogoutButton() {
  const logout = async () => {
    await fetch('/api/employee/auth/login', { method: 'DELETE' })
    window.location.href = '/employee/login'
  }
  return (
    <button
      onClick={logout}
      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
    >
      Déconnexion
    </button>
  )
}
