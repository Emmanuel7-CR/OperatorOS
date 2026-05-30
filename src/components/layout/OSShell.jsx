import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOSStore } from '../../context/OSStore'
import {
  LayoutDashboard, Wallet, CheckSquare, TrendingUp,
  Target, Settings, Menu, X, LogOut, ChevronRight,
  Zap
} from 'lucide-react'
import { ScoreBar } from '../ui/ScoreBar'
import './OSShell.css'

const NAV_ITEMS = [
  { to: '/app',         icon: LayoutDashboard, label: 'OS Home',    end: true },
  { to: '/app/finance', icon: Wallet,          label: 'Finance',    color: 'var(--finance)' },
  { to: '/app/execute', icon: CheckSquare,     label: 'Execute',    color: 'var(--execution)' },
  { to: '/app/growth',  icon: TrendingUp,      label: 'Growth',     color: 'var(--growth)' },
  { to: '/app/vision',  icon: Target,          label: 'Vision',     color: 'var(--vision)' },
  { to: '/app/settings',icon: Settings,        label: 'Settings' },
]

const BOTTOM_NAV = NAV_ITEMS.slice(0, 5)

export function OSShell({ children }) {
  const { user, profile, signOut } = useAuth()
  const { todayScore, fetchTodayScore, fetchWeekScores } = useOSStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (user) {
      fetchTodayScore(user.id)
      fetchWeekScores(user.id)
    }
  }, [user?.id])

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="os-shell">

      {/* ── Sidebar (desktop + mobile drawer) ── */}
      <aside className={`os-sidebar ${sidebarOpen ? 'os-sidebar--open' : ''}`}>
        <div className="os-sidebar__top">
          <div className="os-brand">
            <div className="os-brand__icon"><Zap size={16} /></div>
            <span className="os-brand__name">OperatorOS</span>
          </div>
          <button className="btn btn-icon btn-ghost os-sidebar__close" onClick={() => setSidebarOpen(false)}>
            <X size={17} />
          </button>
        </div>

        {/* Score summary in sidebar */}
        <div className="os-sidebar__score">
          <span className="os-sidebar__score-label">Today's Score</span>
          <div className="os-sidebar__score-value" data-grade={getGrade(todayScore)}>
            {todayScore ?? '—'}
          </div>
        </div>

        <nav className="os-sidebar__nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end, color }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `os-nav-link ${isActive ? 'os-nav-link--active' : ''}`
              }
            >
              <span className="os-nav-link__icon" style={color ? { color } : {}}>
                <Icon size={17} />
              </span>
              <span className="os-nav-link__label">{label}</span>
              <ChevronRight size={13} className="os-nav-link__arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="os-sidebar__footer">
          <div className="os-sidebar__profile">
            <div className="os-avatar">{initials}</div>
            <div className="os-sidebar__user">
              <span className="os-sidebar__name">{profile?.full_name || 'Operator'}</span>
              <span className="os-sidebar__email">{profile?.email || ''}</span>
            </div>
          </div>
          <button className="btn btn-icon btn-ghost os-sidebar__logout" onClick={signOut} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="os-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <div className="os-main">

        {/* Score bar — always visible at top */}
        <ScoreBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="os-content">
          {children}
        </main>
      </div>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="os-bottom-nav">
        {BOTTOM_NAV.map(({ to, icon: Icon, label, end, color }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `os-bottom-item ${isActive ? 'os-bottom-item--active' : ''}`
            }
          >
            <span className="os-bottom-item__icon" style={color ? { '--module-color': color } : {}}>
              <Icon size={21} />
            </span>
            <span className="os-bottom-item__label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function getGrade(score) {
  if (score === null || score === undefined) return 'none'
  if (score >= 90) return 'elite'
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
