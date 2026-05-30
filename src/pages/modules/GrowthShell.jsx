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
      </div>
    </div>
  )
}
