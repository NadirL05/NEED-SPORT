'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/supplier/auth/login', { method: 'DELETE' })
    window.location.href = '/supplier/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
    >
      Se déconnecter
    </button>
  )
}
