<<<<<<< HEAD
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
=======
import { CheckSquare, ListTodo, Flame, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ModulePlaceholder } from '../../components/ui/ModulePlaceholder'
import './ModuleShell.css'

export default function ExecuteShell() {
  return (
    <div className="module-shell">
      <div className="module-shell__badge" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
        <CheckSquare size={14} /> Execute Module
      </div>

      <div className="module-shell__hero">
        <h2>Execution Engine</h2>
        <p>Your tasks, habits, and daily discipline — all measured and scored automatically.</p>
      </div>

      <div className="module-shell__nav">
        <Link to="tasks" className="module-nav-card card card-hover">
          <div className="module-nav-card__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
            <ListTodo size={20} />
          </div>
          <div className="module-nav-card__text">
            <span className="module-nav-card__title">Tasks</span>
            <span className="module-nav-card__sub">Daily, recurring, and priority tasks</span>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>

        <Link to="habits" className="module-nav-card card card-hover">
          <div className="module-nav-card__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
            <Flame size={20} />
          </div>
          <div className="module-nav-card__text">
            <span className="module-nav-card__title">Habits</span>
            <span className="module-nav-card__sub">Streaks, completions, and consistency</span>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>
      </div>

      <div className="module-shell__score-info card">
        <span className="module-shell__score-label">How Execute affects your score</span>
        <div className="module-shell__score-rows">
          <div className="module-shell__score-row">
            <span className="module-shell__score-row-label">Tasks completed today</span>
            <span className="module-shell__score-row-pts" style={{ color: 'var(--execution)' }}>40 pts</span>
          </div>
          <div className="module-shell__score-row">
            <span className="module-shell__score-row-label">Habits completed today</span>
            <span className="module-shell__score-row-pts" style={{ color: 'var(--accent-bright)' }}>35 pts</span>
          </div>
        </div>
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
      </div>
    </div>
  )
}
