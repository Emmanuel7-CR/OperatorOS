import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useExecutionStore } from '../../../context/executionStore'
import { useOSStore } from '../../../context/OSStore'
import { Plus, Flame, X, Check, Pencil, Trash2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import './ExecutePages.css'

const HABIT_ICONS = ['⚡','🏃','📚','💧','🧘','💪','🥗','😴','🎯','✍️','🌅','🧹','💊','🎸','🧠','🚴']
const HABIT_COLORS = ['#7c6dfa','#fd79a8','#00b894','#fdcb6e','#4db8ff','#e17055','#a29bfe','#00cec9','#ff9f43','#55efc4']
const FREQ_LABELS = { daily: 'Every day', weekdays: 'Weekdays', weekends: 'Weekends', weekly: 'Weekly' }

export default function HabitsPage() {
  const { user } = useAuth()
  const {
    habits, habitCompletions, loading,
    fetchHabits, fetchTodayCompletions,
    completeHabit, uncompleteHabit,
    deleteHabit, isCompletedToday,
  } = useExecutionStore()
  const { calculateScore } = useOSStore()

  const [showAdd, setShowAdd]       = useState(false)
  const [editHabit, setEditHabit]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filter, setFilter]         = useState('active')

  useEffect(() => {
    if (user) {
      fetchHabits(user.id)
      fetchTodayCompletions(user.id)
    }
  }, [user?.id])

  const displayed = habits.filter(h =>
    filter === 'active' ? h.is_active : !h.is_active
  )

  const todayDone  = habits.filter(h => h.is_active && isCompletedToday(h.id)).length
  const todayTotal = habits.filter(h => h.is_active).length

  async function handleToggle(habit) {
    const done = isCompletedToday(habit.id)
    try {
      if (done) {
        await uncompleteHabit(habit.id, user.id)
        toast.success('Habit unmarked')
      } else {
        await completeHabit(habit.id, user.id)
        toast.success(`${habit.icon} ${habit.name} — done! 🔥`)
      }
      calculateScore(user.id)
    } catch (e) { toast.error(e.message) }
  }

  async function handleDelete(habit) {
    await deleteHabit(habit.id)
    toast.success('Habit deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="execute-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3>Habits</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {todayDone}/{todayTotal} completed today
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> New Habit
        </button>
      </div>

      {/* Filter pills */}
      <div className="tasks-toolbar">
        {['active','inactive'].map(f => (
          <button
            key={f}
            className={`task-filter-pill ${filter === f ? 'task-filter-pill--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'active' ? '🔥 Active' : '💤 Inactive'}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', opacity: 0.7 }}>
              {habits.filter(h => f === 'active' ? h.is_active : !h.is_active).length}
            </span>
          </button>
        ))}
      </div>

      {loading.habits ? (
        <div className="habits-list">
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '100px' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><Flame size={24} /></div>
          <h4>{filter === 'active' ? 'No active habits' : 'No inactive habits'}</h4>
          <p>{filter === 'active' ? 'Build your first daily habit to start your streak' : 'All habits are currently active'}</p>
          {filter === 'active' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Habit
            </button>
          )}
        </div>
      ) : (
        <div className="habits-list">
          {displayed.map(habit => {
            const done = isCompletedToday(habit.id)
            return (
              <div
                key={habit.id}
                className="habit-card card"
                style={done ? {
                  borderColor: `color-mix(in srgb, ${habit.color} 35%, transparent)`,
                  background: `color-mix(in srgb, ${habit.color} 7%, var(--bg-card))`,
                } : {}}
              >
                <div className="habit-card__header">
                  {/* Icon */}
                  <div
                    className="habit-card__icon"
                    style={{ background: habit.color + '22', color: habit.color }}
                  >
                    {habit.icon}
                  </div>

                  {/* Info */}
                  <div className="habit-card__info">
                    <span className="habit-card__name">{habit.name}</span>
                    <span className="habit-card__freq">{FREQ_LABELS[habit.frequency]}</span>
                  </div>

                  {/* Actions */}
                  <div className="habit-card__actions">
                    <button className="icon-action-btn" onClick={() => setEditHabit(habit)}>
                      <Pencil size={12} />
                    </button>
                    <button className="icon-action-btn icon-action-btn--danger" onClick={() => setDeleteTarget(habit)}>
                      <Trash2 size={12} />
                    </button>
                    {/* Complete toggle */}
                    {habit.is_active && (
                      <button
                        className={`task-check ${done ? 'task-check--done' : ''}`}
                        style={{ borderColor: done ? habit.color : undefined, background: done ? habit.color : undefined }}
                        onClick={() => handleToggle(habit)}
                      >
                        {done && <span className="task-check__tick">✓</span>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="habit-card__stats">
                  <div className="habit-stat">
                    <span className="habit-stat__label">Streak</span>
                    <span className="habit-stat__value" style={{ color: habit.current_streak > 0 ? habit.color : 'var(--text-muted)' }}>
                      {habit.current_streak > 0 ? `🔥 ${habit.current_streak}` : '—'}
                    </span>
                  </div>
                  <div className="habit-stat">
                    <span className="habit-stat__label">Best</span>
                    <span className="habit-stat__value">{habit.longest_streak || 0}</span>
                  </div>
                  <div className="habit-stat">
                    <span className="habit-stat__label">Total</span>
                    <span className="habit-stat__value">{habit.total_completions || 0}</span>
                  </div>
                  <div className="habit-stat" style={{ marginLeft: 'auto' }}>
                    <span className="habit-stat__label">Today</span>
                    <span className="habit-stat__value" style={{ color: done ? habit.color : 'var(--text-muted)' }}>
                      {done ? '✅ Done' : '○ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="task-add-fab" onClick={() => setShowAdd(true)}>
        <Plus size={22} />
      </button>

      {showAdd      && <HabitFormModal userId={user.id} onClose={() => setShowAdd(false)} />}
      {editHabit    && <HabitFormModal userId={user.id} existing={editHabit} onClose={() => setEditHabit(null)} />}
      {deleteTarget && (
        <HabitDeleteModal
          habit={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── Habit Form Modal ──────────────────────────────────────────
function HabitFormModal({ userId, existing, onClose }) {
  const { addHabit, updateHabit } = useExecutionStore()
  const [form, setForm] = useState({
    name:        existing?.name        || '',
    description: existing?.description || '',
    icon:        existing?.icon        || '⚡',
    color:       existing?.color       || '#7c6dfa',
    frequency:   existing?.frequency   || 'daily',
    is_active:   existing?.is_active   ?? true,
  })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setLoading(true)
    try {
      const payload = { ...form, user_id: userId }
      if (existing) {
        await updateHabit(existing.id, payload)
        toast.success('Habit updated')
      } else {
        await addHabit(payload)
        toast.success(`${form.icon} ${form.name} habit created!`)
      }
      onClose()
    } catch (e) { toast.error(e.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Habit' : 'New Habit'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: 'var(--r-md)',
                    border: `1.5px solid ${form.icon === icon ? form.color : 'var(--border)'}`,
                    background: form.icon === icon ? form.color + '22' : 'var(--bg-surface)',
                    cursor: 'pointer', fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.14s',
                  }}
                  onClick={() => set('icon', icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  style={{
                    width: '26px', height: '26px',
                    borderRadius: '50%',
                    background: color,
                    border: 'none',
                    cursor: 'pointer',
                    outline: form.color === color ? '2.5px solid white' : 'none',
                    outlineOffset: '2px',
                    transition: 'transform 0.14s',
                  }}
                  onClick={() => set('color', color)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Habit Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Morning run, Read 30 mins"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              className="form-input"
              type="text"
              placeholder="Why does this habit matter?"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select className="form-select" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              <option value="daily">Daily — every day</option>
              <option value="weekdays">Weekdays — Mon to Fri</option>
              <option value="weekends">Weekends — Sat & Sun</option>
              <option value="weekly">Weekly — once a week</option>
            </select>
          </div>

          {existing && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
              />
              Active habit
            </label>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-full"
            style={{ background: form.color, color: 'white', fontWeight: 700 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> {existing ? 'Save Changes' : 'Create Habit'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Habit Delete Modal ────────────────────────────────────────
function HabitDeleteModal({ habit, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    try { await onConfirm() }
    catch (e) { toast.error(e.message); setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Delete Habit</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Delete <strong style={{ color: 'var(--text-primary)' }}>{habit.icon} {habit.name}</strong>?
            Your streak of <strong style={{ color: habit.color }}>{habit.current_streak} days</strong> and all
            completion history will be permanently lost.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-full" onClick={handle} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Trash2 size={14} /> Delete Habit</>}
          </button>
        </div>
      </div>
    </div>
  )
}
