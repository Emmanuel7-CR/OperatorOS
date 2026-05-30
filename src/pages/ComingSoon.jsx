import { Zap } from 'lucide-react'

export default function ComingSoon({ label = 'This section' }) {
  return (
    <div className="empty-state" style={{ minHeight: '300px' }}>
      <div className="empty-state-icon">
        <Zap size={24} />
      </div>
      <h4 style={{ color: 'var(--text-secondary)' }}>{label}</h4>
      <p>Coming in a future phase. The OS shell is live.</p>
    </div>
  )
}
