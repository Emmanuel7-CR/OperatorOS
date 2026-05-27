import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--sp-6)',
      background: 'var(--bg-base)',
      padding: 'var(--sp-6)',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
      }}>
        ⚡
      </div>
      <div>
        <h2 style={{ marginBottom: '8px' }}>Route not found</h2>
        <p style={{ fontSize: '0.9rem' }}>This path doesn't exist in the OS.</p>
      </div>
      <Link to="/app" className="btn btn-primary">
        Return to OS Home
      </Link>
    </div>
  )
}
