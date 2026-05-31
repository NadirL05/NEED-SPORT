export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .2; }
          50%       { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid var(--accent)',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          color: 'var(--text-2)',
          fontSize: '.8rem',
          marginTop: 16,
          display: 'block',
          textAlign: 'center',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
        }}
      >
        Chargement…
      </span>
    </div>
  )
}
