import { Routes, Route, NavLink, Outlet } from 'react-router-dom'
import { Wallet, ArrowLeftRight, PieChart, TrendingUp, Target } from 'lucide-react'
import './FinanceShell.css'

const FINANCE_NAV = [
  { to: '',        label: 'Overview',      icon: <Wallet size={15} />,         end: true },
  { to: 'txns',    label: 'Transactions',  icon: <ArrowLeftRight size={15} /> },
  { to: 'budgets', label: 'Budgets',       icon: <PieChart size={15} /> },
  { to: 'reports', label: 'Reports',       icon: <TrendingUp size={15} /> },
  { to: 'goals',   label: 'Goals',         icon: <Target size={15} /> },
]

export default function FinanceShell() {
  return (
    <div className="finance-shell">
      <div className="finance-shell__header">
        <div className="finance-shell__title-row">
          <div className="finance-shell__icon">
            <Wallet size={18} />
          </div>
          <h2>Finance</h2>
        </div>
        <nav className="finance-tab-nav">
          {FINANCE_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `finance-tab ${isActive ? 'finance-tab--active' : ''}`
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
