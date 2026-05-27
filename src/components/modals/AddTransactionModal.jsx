import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useFinanceStore } from '../../context/financeStore'
import { X, Check } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './FinanceModals.css'

const EMPTY = {
  title: '', amount: '', type: 'expense',
  category: '', date: format(new Date(), 'yyyy-MM-dd'), note: '',
}

export function AddTransactionModal({ onClose, existing }) {
  const { user, profile } = useAuth()
  const { addTransaction, updateTransaction, categories } = useFinanceStore()
  const [form, setForm] = useState(existing
    ? { ...existing, date: existing.date.split('T')[0], amount: String(existing.amount) }
    : EMPTY
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const symbol = profile?.currency === 'USD' ? '$' : '₦'

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim())                               e.title    = 'Title required'
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount'
    if (!form.category)                                   e.category = 'Select a category'
    if (!form.date)                                       e.date     = 'Date required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount), user_id: user.id }
      if (existing) {
        await updateTransaction(existing.id, payload)
        toast.success('Transaction updated')
      } else {
        await addTransaction(payload)
        toast.success(form.type === 'income' ? '💰 Income added!' : '💸 Expense recorded')
      }
      onClose()
    } catch (e) {
      toast.error(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="modal-body">
          {/* Type toggle */}
          <div className="type-toggle">
            {['expense','income'].map(t => (
              <button
                key={t}
                className={`type-toggle__btn ${form.type === t ? `type-toggle__btn--${t} type-toggle__btn--active` : ''}`}
                onClick={() => set('type', t)}
              >
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="amount-input-wrap">
            <span className="amount-input__prefix">{symbol}</span>
            <input
              className={`amount-input ${errors.amount ? 'amount-input--error' : ''}`}
              type="number" inputMode="decimal" placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              min="0" step="0.01"
            />
          </div>
          {errors.amount && <span className="form-error">{errors.amount}</span>}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              type="text" placeholder="e.g. Groceries"
              value={form.title} onChange={e => set('title', e.target.value)}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category grid */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="cat-grid">
              {categories.map(cat => (
                <button
                  key={cat.id || cat.name}
                  className={`cat-btn ${form.category === cat.name ? 'cat-btn--active' : ''}`}
                  style={form.category === cat.name ? { '--cat-color': cat.color } : {}}
                  onClick={() => set('category', cat.name)}
                >
                  <span className="cat-btn__icon">{cat.icon}</span>
                  <span className="cat-btn__name">{cat.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className={`form-input ${errors.date ? 'form-input--error' : ''}`}
              type="date" value={form.date}
              onChange={e => set('date', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea
              className="form-textarea" rows={2} placeholder="Add a note…"
              value={form.note} onChange={e => set('note', e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className={`btn btn-full ${form.type === 'income' ? 'btn-income' : 'btn-primary'}`}
            onClick={handleSubmit} disabled={loading}
          >
            {loading
              ? <span className="btn-spinner" />
              : <><Check size={15} /> {existing ? 'Update' : form.type === 'income' ? 'Add Income' : 'Add Expense'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
