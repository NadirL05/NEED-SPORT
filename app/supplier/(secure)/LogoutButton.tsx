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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        color: '#475569',
        fontSize: '0.8rem',
        cursor: 'pointer',
        padding: 0,
        width: '100%',
        textAlign: 'left',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M5 12H2.5A1.5 1.5 0 011 10.5v-7A1.5 1.5 0 012.5 2H5M9.5 10l3-3-3-3M12.5 7H5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Se déconnecter
    </button>
  )
}
