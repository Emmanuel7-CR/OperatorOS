import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useFinanceStore } from '../../context/financeStore'
import { formatCurrency, formatDate, getCategoryInfo, groupByDay } from '../../utils/financeHelpers'
import { Plus, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AddTransactionModal } from '../../components/modals/AddTransactionModal'
import { MonthPicker } from '../../components/ui/MonthPicker'
import { format } from 'date-fns'
import './FinanceOverview.css'

export default function FinanceOverview() {
  const { user, profile } = useAuth()
  const {
    transactions, categories, loading,
    fetchMonthly, fetchCategories, getStats,
    currentMonth, currentYear,
  } = useFinanceStore()

  const [showAdd, setShowAdd] = useState(false)
  const currency = profile?.currency || 'NGN'

  useEffect(() => {
    if (!user) return
    fetchMonthly(user.id)
    fetchCategories(user.id)
  }, [user?.id, currentMonth, currentYear])

  const stats    = getStats()
  const groups   = groupByDay(transactions).slice(0, 3)
  const isLoading = loading.transactions

  function fmt(n) { return formatCurrency(n, currency) }

  return (
    <div className="finance-overview">

      {/* Balance cards */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <MonthPicker />
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add
        </button>
      </div>

      <div className="finance-stats">
        <div className="finance-stat-card card" style={{
          background: 'linear-gradient(135deg, #131330 0%, #0e0e28 100%)',
          borderColor: 'rgba(108,92,231,0.2)',
        }}>
          <span className="finance-stat-card__label">Balance</span>
          {isLoading
            ? <div className="skeleton" style={{ height: '24px', width: '100px', marginTop: '4px' }} />
            : <span className={`finance-stat-card__value ${stats.balance >= 0 ? 'amount-income' : 'amount-expense'}`}>
                {fmt(stats.balance)}
              </span>
          }
          <span className="finance-stat-card__sub">{format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}</span>
        </div>

        <div className="finance-stat-card card">
          <span className="finance-stat-card__label">Income</span>
          {isLoading
            ? <div className="skeleton" style={{ height: '20px', width: '80px', marginTop: '4px' }} />
            : <span className="finance-stat-card__value amount-income">{fmt(stats.income)}</span>
          }
          <div className="finance-stat-card__icon finance-stat-card__icon--income"><TrendingUp size={13} /></div>
        </div>

        <div className="finance-stat-card card">
          <span className="finance-stat-card__label">Expenses</span>
          {isLoading
            ? <div className="skeleton" style={{ height: '20px', width: '80px', marginTop: '4px' }} />
            : <span className="finance-stat-card__value amount-expense">{fmt(stats.expenses)}</span>
          }
          <div className="finance-stat-card__icon finance-stat-card__icon--expense"><TrendingDown size={13} /></div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="section-header">
        <h3 style={{ fontSize: '0.92rem' }}>Recent Activity</h3>
        <Link to="txns" className="section-header__link">View all <ArrowRight size={13} /></Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div className="skeleton" style={{ width: '55%', height: '12px' }} />
                <div className="skeleton" style={{ width: '35%', height: '10px' }} />
              </div>
              <div className="skeleton" style={{ width: '64px', height: '13px' }} />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">💳</div>
          <h4>No transactions this month</h4>
          <p>Add your first transaction to start tracking</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      ) : (
        <>
          {groups.map(({ date, items }) => (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {formatDate(date)}
              </span>
              <div className="card" style={{ padding: '4px 0' }}>
                {items.map((t, i) => {
                  const cat = getCategoryInfo(categories, t.category)
                  return (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: '11px',
                      padding: '10px 14px',
                      borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: cat.color + '22', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cat.name}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 500, flexShrink: 0 }}
                        className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quick nav */}
          <div className="finance-quick-nav">
            {[
              { to: 'txns',    label: 'Transactions', icon: '💳' },
              { to: 'budgets', label: 'Budgets',       icon: '📊' },
              { to: 'reports', label: 'Reports',       icon: '📈' },
              { to: 'goals',   label: 'Goals',         icon: '🎯' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="finance-quick-btn card card-hover">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
