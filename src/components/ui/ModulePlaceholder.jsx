import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './ModulePlaceholder.css'

export function ModulePlaceholder({ icon, name, color, dim, description, links = [] }) {
  return (
    <div className="mod-placeholder">
      <div className="mod-placeholder__header">
        <div className="mod-placeholder__icon" style={{ background: dim, color }}>
          {icon}
        </div>
        <div>
          <span className="badge" style={{ background: dim, color, marginBottom: '6px' }}>
            Module
          </span>
          <h2>{name}</h2>
          <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>{description}</p>
        </div>
      </div>

      {links.length > 0 && (
        <div className="mod-placeholder__links">
          {links.map(link => (
            <Link key={link.to} to={link.to} className="mod-placeholder__link card card-hover">
              <div className="mod-placeholder__link-icon" style={{ background: dim, color }}>
                {link.icon}
              </div>
              <div className="mod-placeholder__link-text">
                <span className="mod-placeholder__link-title">{link.label}</span>
                <span className="mod-placeholder__link-sub">{link.sub}</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
