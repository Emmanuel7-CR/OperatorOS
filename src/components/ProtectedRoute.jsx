import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <OSLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/app" replace />
  return children
}

function OSLoader() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      gap: '20px',
    }}>
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '12px',
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem',
        boxShadow: 'var(--shadow-accent)',
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}>
        ⚡
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>
        Initialising OS…
      </p>
    </div>
  )
}
