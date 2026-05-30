import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFinanceStore } from '../../../context/financeStore'
import { formatCurrency, calcPct, getCategoryInfo, formatMonthYear } from '../../../utils/financeHelpers'
import { Plus, Pencil, Trash2, AlertTriangle, X, Check } from 'lucide-react'
import { MonthPicker } from '../../../components/ui/MonthPicker'
import toast from 'react-hot-toast'
import './FinancePages.css'

export default function BudgetsPage() {
  const { user, profile } = useAuth()
  const {
    budgets, transactions, categories, loading,
    fetchBudgets, fetchMonthly, upsertBudget, deleteBudget,
    currentMonth, currentYear,
  } = useFinanceStore()

  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const currency = profile?.currency || 'NGN'

  useEffect(() => {
    if (user) { fetchBudgets(user.id); fetchMonthly(user.id) }
  }, [user?.id, currentMonth, currentYear])

  const spent = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})

  const totalBudget  = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent   = budgets.reduce((s, b) => s + (spent[b.category] || 0), 0)
  const overCount    = budgets.filter(b => (spent[b.category] || 0) > b.amount).length

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3>Budgets</h3>
          <MonthPicker />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditBudget(null); setShowForm(true) }}>
          <Plus size={15} /> Set Budget
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div className="report-stat__label">Budgeted</div>
              <div className="report-stat__value">{formatCurrency(totalBudget, currency)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="report-stat__label">Spent</div>
              <div className={`report-stat__value ${totalSpent > totalBudget ? 'amount-expense' : 'amount-income'}`}>
                {formatCurrency(totalSpent, currency)}
              </div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{
              width: `${Math.min(calcPct(totalSpent, totalBudget), 100)}%`,
              background: totalSpent > totalBudget ? 'var(--expense)' : 'var(--accent)',
            }} />
          </div>
          {overCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--expense)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              <AlertTriangle size={13} /> {overCount} categor{overCount > 1 ? 'ies' : 'y'} over budget
            </div>
          )}
        </div>
      )}

      {loading.budgets ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '90px' }} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📊</div>
          <h4>No budgets set</h4>
          <p>Set monthly spending limits by category</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> Set Budget</button>
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map(budget => {
            const cat     = getCategoryInfo(categories, budget.category)
            const s       = spent[budget.category] || 0
            const pct     = calcPct(s, budget.amount)
            const isOver  = s > budget.amount
            const isWarn  = pct >= 80 && !isOver
            return (
              <div key={budget.id} className={`budget-item card ${isOver ? 'budget-item--over' : isWarn ? 'budget-item--warning' : ''}`}>
                <div className="budget-item__header">
                  <div className="budget-item__cat">
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--r-md)', background: cat.color + '22', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      {cat.icon}
                    </div>
                    <div className="budget-item__cat-info">
                      <span className="budget-item__name">{cat.name}</span>
                      {isOver && <span className="badge badge-expense" style={{ fontSize: '0.65rem' }}><AlertTriangle size={9} /> Over</span>}
                      {isWarn && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>⚠️ 80%</span>}
                    </div>
                  </div>
                  <div className="budget-item__actions">
                    <button className="icon-action-btn" onClick={() => { setEditBudget(budget); setShowForm(true) }}><Pencil size={12} /></button>
                    <button className="icon-action-btn icon-action-btn--danger" onClick={async () => { await deleteBudget(budget.id); toast.success('Budget removed') }}><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="budget-item__amounts">
                  <span className={isOver ? 'amount-expense' : ''}>{formatCurrency(s, currency)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>of {formatCurrency(budget.amount, currency)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isOver ? 'var(--expense)' : 'var(--text-muted)' }}>{pct}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: isOver ? 'var(--expense)' : isWarn ? 'var(--warning)' : cat.color,
                  }} />
                </div>
                {isOver && (
                  <div className="budget-item__overage">
                    Overspent by {formatCurrency(s - budget.amount, currency)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <BudgetFormModal
          existing={editBudget}
          categories={categories}
          currency={currency}
          userId={user.id}
          currentMonth={currentMonth}
          currentYear={currentYear}
          upsertBudget={upsertBudget}
          onClose={() => { setShowForm(false); setEditBudget(null) }}
        />
      )}
    </div>
  )
}

function BudgetFormModal({ existing, categories, currency, userId, currentMonth, currentYear, upsertBudget, onClose }) {
  const [category, setCategory] = useState(existing?.category || '')
  const [amount, setAmount]     = useState(existing ? String(existing.amount) : '')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit() {
    if (!category || !amount || isNaN(+amount) || +amount <= 0) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      await upsertBudget({ id: existing?.id, user_id: userId, category, amount: parseFloat(amount), month: currentMonth, year: currentYear })
      toast.success(existing ? 'Budget updated' : 'Budget created')
      onClose()
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Budget' : 'Set Budget'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit</label>
            <input className="form-input" type="number" inputMode="decimal" placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> {existing ? 'Update' : 'Save'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
