import { NavLink, Outlet } from 'react-router-dom'
import { CheckSquare, Flame, LayoutDashboard } from 'lucide-react'
import './FinanceShell.css'

const EXEC_NAV = [
  { to: '',       label: 'Today',  icon: <LayoutDashboard size={15} />, end: true },
  { to: 'tasks',  label: 'Tasks',  icon: <CheckSquare size={15} /> },
  { to: 'habits', label: 'Habits', icon: <Flame size={15} /> },
]

export default function ExecuteShell() {
  return (
    <div className="finance-shell">
      <div className="finance-shell__header">
        <div className="finance-shell__title-row">
          <div className="finance-shell__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
            <CheckSquare size={18} />
          </div>
          <h2>Execute</h2>
        </div>
        <nav className="finance-tab-nav">
          {EXEC_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `finance-tab ${isActive ? 'finance-tab--active finance-tab--execute' : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="finance-shell__content">
        <Outlet />
      </div>
    </div>
  )
}
