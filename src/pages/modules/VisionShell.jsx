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
      </div>
    </div>
  )
}
