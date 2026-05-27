import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFinanceStore } from '../../../context/financeStore'
import { formatCurrency, formatDate, getCategoryInfo, groupByDay } from '../../../utils/financeHelpers'
import { Plus, Search, SlidersHorizontal, X, Pencil, Trash2 } from 'lucide-react'
import { AddTransactionModal } from '../../../components/modals/AddTransactionModal'
import toast from 'react-hot-toast'
import './FinancePages.css'

export default function TransactionsPage() {
  const { user, profile } = useAuth()
  const {
    transactions, categories, loading,
    fetchTransactions, deleteTransaction,
    filters, setFilters, clearFilters,
  } = useFinanceStore()

  const [showAdd, setShowAdd]       = useState(false)
  const [editTx, setEditTx]         = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const currency = profile?.currency || 'NGN'

  const { type, category, dateFrom, dateTo, search } = filters

  useEffect(() => {
    if (user) fetchTransactions(user.id, filters)
  }, [user?.id, type, category, dateFrom, dateTo, search])

  useEffect(() => {
    if (user) fetchTransactions(user.id)
  }, [user?.id])

  const hasFilters = type || category || dateFrom || dateTo || search
  const groups = groupByDay(transactions)

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <h3>Transactions</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Search bar */}
      <div className="search-row">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="search" placeholder="Search…"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
          />
          {filters.search && (
            <button className="search-clear" onClick={() => setFilters({ search: '' })}><X size={13} /></button>
          )}
        </div>
        <button
          className={`btn btn-icon btn-secondary ${hasFilters ? 'btn--active-filter' : ''}`}
          onClick={() => setShowFilters(v => !v)}
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card filter-panel animate-slide-up">
          <div className="filter-panel__head">
            <span>Filters</span>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => { clearFilters(); setShowFilters(false) }}>Clear</button>}
          </div>
          <div className="filter-grid">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={filters.type} onChange={e => setFilters({ type: e.target.value })}>
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={filters.category} onChange={e => setFilters({ category: e.target.value })}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From</label>
              <input className="form-input" type="date" value={filters.dateFrom} onChange={e => setFilters({ dateFrom: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input className="form-input" type="date" value={filters.dateTo} onChange={e => setFilters({ dateTo: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading.transactions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '4px 0' }}>
              <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div className="skeleton" style={{ width: '55%', height: '13px' }} />
                <div className="skeleton" style={{ width: '35%', height: '11px' }} />
              </div>
              <div className="skeleton" style={{ width: '68px', height: '14px' }} />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">💳</div>
          <h4>{hasFilters ? 'No results' : 'No transactions yet'}</h4>
          <p>{hasFilters ? 'Try adjusting your filters' : 'Add your first transaction to start tracking'}</p>
          {hasFilters
            ? <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>
            : <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Transaction</button>
          }
        </div>
      ) : (
        <div className="tx-groups">
          {groups.map(({ date, items }) => (
            <div key={date} className="tx-group">
              <div className="tx-group__header">
                <span className="tx-group__date">{formatDate(date)}</span>
                <span className="tx-group__total">
                  {formatCurrency(
                    items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0),
                    currency
                  )}
                </span>
              </div>
              <div className="card" style={{ padding: '4px 0' }}>
                {items.map((t, i) => {
                  const cat = getCategoryInfo(categories, t.category)
                  return (
                    <div key={t.id} className={`tx-item ${i < items.length - 1 ? 'tx-item--divider' : ''} ${deletingId === t.id ? 'tx-item--deleting' : ''}`}>
                      <div className="tx-item__icon" style={{ background: cat.color + '22', color: cat.color }}>{cat.icon}</div>
                      <div className="tx-item__info">
                        <span className="tx-item__title">{t.title}</span>
                        <div className="tx-item__meta">
                          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{cat.name}</span>
                          {t.note && <span className="tx-item__note">· {t.note}</span>}
                        </div>
                      </div>
                      <div className="tx-item__right">
                        <span className={`tx-item__amount ${t.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                        </span>
                        <div className="tx-item__actions">
                          <button className="icon-action-btn" onClick={() => setEditTx(t)}><Pencil size={12} /></button>
                          <button className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(t.id)}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="finance-fab" onClick={() => setShowAdd(true)}>
        <Plus size={22} />
      </button>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      {editTx   && <AddTransactionModal existing={editTx} onClose={() => setEditTx(null)} />}
    </div>
  )
}
