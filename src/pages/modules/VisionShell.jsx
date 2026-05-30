<<<<<<< HEAD
import { NavLink, Outlet } from 'react-router-dom'
import { Target, Star } from 'lucide-react'
import './FinanceShell.css'

export default function VisionShell() {
  return (
    <div className="finance-shell">
      <div className="finance-shell__header">
        <div className="finance-shell__title-row">
          <div className="finance-shell__icon" style={{ background: 'var(--vision-dim)', color: 'var(--vision)' }}>
            <Target size={18} />
          </div>
          <h2>Vision</h2>
        </div>
        <nav className="finance-tab-nav">
          <NavLink
            to="board"
            className={({ isActive }) =>
              `finance-tab ${isActive ? 'finance-tab--active finance-tab--vision' : ''}`
            }
          >
            <Star size={15} />
            <span>Dream Board</span>
          </NavLink>
        </nav>
      </div>
      <div className="finance-shell__content">
        <Outlet />
=======
import { Target, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './ModuleShell.css'

export default function VisionShell() {
  return (
    <div className="module-shell">
      <div className="module-shell__badge" style={{ background: 'var(--vision-dim)', color: 'var(--vision)' }}>
        <Target size={14} /> Vision Module
      </div>

      <div className="module-shell__hero">
        <h2>Vision Board</h2>
        <p>Define your dream life. Set measurable milestones. Know exactly what you are building toward.</p>
      </div>

      <div className="module-shell__nav">
        <Link to="board" className="module-nav-card card card-hover">
          <div className="module-nav-card__icon" style={{ background: 'var(--vision-dim)', color: 'var(--vision)' }}>
            <Star size={20} />
          </div>
          <div className="module-nav-card__text">
            <span className="module-nav-card__title">Dream Board</span>
            <span className="module-nav-card__sub">Goals, milestones, and affirmations</span>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>
      </div>

      <div className="module-shell__score-info card">
        <span className="module-shell__score-label">Vision Module — coming in Phase 7</span>
        <div className="module-shell__score-rows">
          <div className="module-shell__score-row">
            <span className="module-shell__score-row-label">Define goals to track long-term progress</span>
            <span className="module-shell__score-row-pts" style={{ color: 'var(--vision)' }}>Always on</span>
          </div>
        </div>
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
      </div>
    </div>
  )
}
