import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFinanceStore } from '../../../context/financeStore'
import { formatCurrency, calcPct, formatDate } from '../../../utils/financeHelpers'
import { Plus, Trash2, PlusCircle, X, Check, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './FinancePages.css'

const GOAL_ICONS = ['🎯','🏠','✈️','🚗','💻','💍','🎓','🏝️','📱','💰','🛒','🎸']

export default function GoalsPage() {
  const { user, profile } = useAuth()
  const {
    savingsGoals, loading,
    fetchSavingsGoals, addSavingsGoal, updateSavingsGoal,
    deleteSavingsGoal, addContribution,
  } = useFinanceStore()

  const [showAdd,        setShowAdd]        = useState(false)
  const [editGoal,       setEditGoal]       = useState(null)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const currency = profile?.currency || 'NGN'

  useEffect(() => {
    if (user) fetchSavingsGoals(user.id)
  }, [user?.id])

  return (
    <div className="finance-page">
      <div className="finance-page__header">
        <h3>Savings Goals</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> New Goal
        </button>
      </div>

      {loading.savings ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1,2].map(i => <div key={i} className="card skeleton" style={{ height: '140px' }} />)}
        </div>
      ) : savingsGoals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🎯</div>
          <h4>No savings goals</h4>
          <p>Create a goal to track your financial milestones</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Create Goal</button>
        </div>
      ) : (
        <div className="goals-list">
          {savingsGoals.map(goal => {
            const pct       = calcPct(goal.current_amount || 0, goal.target_amount)
            const isComplete = pct >= 100
            const remaining  = Math.max(0, goal.target_amount - (goal.current_amount || 0))
            return (
              <div key={goal.id} className={`goal-card card ${isComplete ? 'goal-card--complete' : ''}`}>
                <div className="goal-card__header">
                  <div className="goal-card__icon">{goal.icon || '🎯'}</div>
                  <div className="goal-card__info">
                    <h4>{goal.name}</h4>
                    {goal.deadline && <span className="goal-card__deadline">Due {formatDate(goal.deadline)}</span>}
                  </div>
                  {isComplete && <span className="badge badge-income">✅ Complete</span>}
                  <div className="goal-card__actions">
                    <button className="icon-action-btn" onClick={() => setEditGoal(goal)}><Pencil size={12} /></button>
                    <button className="icon-action-btn icon-action-btn--danger" onClick={() => setDeleteTarget(goal)}><Trash2 size={12} /></button>
                  </div>
                </div>

                <div className="goal-amounts">
                  <div>
                    <span className="goal-label">Saved</span>
                    <span className="goal-value amount-income">{formatCurrency(goal.current_amount || 0, currency)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="goal-label">Target</span>
                    <span className="goal-value">{formatCurrency(goal.target_amount, currency)}</span>
                  </div>
                </div>

                <div>
                  <div className="goal-pct">{pct}%</div>
                  <div className="progress-bar-container" style={{ height: '7px' }}>
                    <div className="progress-bar-fill" style={{
                      width: `${pct}%`,
                      background: isComplete ? 'var(--income)' : 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
                    }} />
                  </div>
                </div>

                {!isComplete && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="goal-remaining">{formatCurrency(remaining, currency)} remaining</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setContributeGoal(goal)}
                    >
                      <PlusCircle size={13} /> Contribute
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <GoalFormModal
          onSave={async data => {
            await addSavingsGoal({ ...data, user_id: user.id, current_amount: 0 })
            toast.success('Goal created 🎯')
            fetchSavingsGoals(user.id)
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editGoal && (
        <GoalFormModal
          existing={editGoal}
          onSave={async data => {
            await updateSavingsGoal(editGoal.id, data)
            toast.success('Goal updated')
            fetchSavingsGoals(user.id)
          }}
          onClose={() => setEditGoal(null)}
        />
      )}

      {/* Contribute modal */}
      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          currency={currency}
          onSave={async amount => {
            await addContribution({
              goal_id: contributeGoal.id,
              user_id: user.id,
              amount,
              date: format(new Date(), 'yyyy-MM-dd'),
            })
            toast.success(`Added ${formatCurrency(amount, currency)} to ${contributeGoal.name}!`)
            fetchSavingsGoals(user.id)
          }}
          onClose={() => setContributeGoal(null)}
        />
      )}

      {/* Delete confirm — no window.confirm() (blocked on iOS PWA) */}
      {deleteTarget && (
        <DeleteConfirmModal
          name={`${deleteTarget.icon || '🎯'} ${deleteTarget.name}`}
          onConfirm={async () => {
            await deleteSavingsGoal(deleteTarget.id)
            toast.success('Goal deleted')
            setDeleteTarget(null)
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── Goal Form Modal ───────────────────────────────────────────
function GoalFormModal({ existing, onSave, onClose }) {
  const [form, setForm] = useState({
    name:          existing?.name          || '',
    target_amount: existing?.target_amount ? String(existing.target_amount) : '',
    deadline:      existing?.deadline      ? existing.deadline.split('T')[0] : '',
    icon:          existing?.icon          || '🎯',
  })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.name.trim())                                      { toast.error('Enter a goal name');     return }
    if (!form.target_amount || isNaN(+form.target_amount) || +form.target_amount <= 0)
                                                                { toast.error('Enter a target amount'); return }
    setLoading(true)
    try {
      await onSave({ name: form.name.trim(), target_amount: parseFloat(form.target_amount), deadline: form.deadline || null, icon: form.icon })
      onClose()
    } catch (e) { toast.error(e.message || 'Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Goal' : 'New Savings Goal'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon}
                  style={{
                    width: '42px', height: '42px',
                    borderRadius: 'var(--r-md)',
                    border: `1.5px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.icon === icon ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    cursor: 'pointer', fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => set('icon', icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input className="form-input" type="text" placeholder="e.g. Emergency Fund" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Amount</label>
            <input className="form-input" type="number" inputMode="decimal" placeholder="e.g. 500000" value={form.target_amount} onChange={e => set('target_amount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Date (optional)</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={format(new Date(), 'yyyy-MM-dd')} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> {existing ? 'Save Changes' : 'Create Goal'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Contribute Modal ─────────────────────────────────────────
function ContributeModal({ goal, currency, onSave, onClose }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!amount || isNaN(+amount) || +amount <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    try { await onSave(parseFloat(amount)); onClose() }
    catch (e) { toast.error(e.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{goal.icon} Add to {goal.name}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-income btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> Add Contribution</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ─────────────────────────────────────
function DeleteConfirmModal({ name, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    try { await onConfirm() }
    catch (e) { toast.error(e.message || 'Delete failed'); setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Delete Goal</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <p className="delete-confirm-text">
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>?
            This cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-full" onClick={handle} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  )
}
