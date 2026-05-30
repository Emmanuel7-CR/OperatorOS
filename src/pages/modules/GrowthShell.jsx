<<<<<<< HEAD
import { NavLink, Outlet } from 'react-router-dom'
import { TrendingUp, Users } from 'lucide-react'
import './FinanceShell.css'

export default function GrowthShell() {
  return (
    <div className="finance-shell">
      <div className="finance-shell__header">
        <div className="finance-shell__title-row">
          <div className="finance-shell__icon" style={{ background: 'var(--growth-dim)', color: 'var(--growth)' }}>
            <TrendingUp size={18} />
          </div>
          <h2>Growth</h2>
        </div>
        <nav className="finance-tab-nav">
          <NavLink
            to="outreach"
            className={({ isActive }) =>
              `finance-tab ${isActive ? 'finance-tab--active finance-tab--growth' : ''}`
            }
          >
            <Users size={15} />
            <span>Outreach</span>
          </NavLink>
        </nav>
      </div>
      <div className="finance-shell__content">
        <Outlet />
=======
import { TrendingUp, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ModuleShell.css'

export default function GrowthShell() {
  return (
    <div className="module-shell">
      <div className="module-shell__badge" style={{ background: 'var(--growth-dim)', color: 'var(--growth)' }}>
        <TrendingUp size={14} /> Growth Module
      </div>

      <div className="module-shell__hero">
        <h2>Growth Engine</h2>
        <p>Log every outreach. Track your pipeline. Momentum is built through daily action.</p>
      </div>

      <div className="module-shell__nav">
        <Link to="outreach" className="module-nav-card card card-hover">
          <div className="module-nav-card__icon" style={{ background: 'var(--growth-dim)', color: 'var(--growth)' }}>
            <Users size={20} />
          </div>
          <div className="module-nav-card__text">
            <span className="module-nav-card__title">Outreach CRM</span>
            <span className="module-nav-card__sub">Log contacts, track status, follow-ups</span>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>
      </div>

      <div className="module-shell__score-info card">
        <span className="module-shell__score-label">How Growth affects your score</span>
        <div className="module-shell__score-rows">
          <div className="module-shell__score-row">
            <span className="module-shell__score-row-label">Outreach logged vs daily target</span>
            <span className="module-shell__score-row-pts" style={{ color: 'var(--growth)' }}>15 pts</span>
          </div>
        </div>
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
      </div>
    </div>
  )
}
