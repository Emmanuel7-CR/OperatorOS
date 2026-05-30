import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useExecutionStore } from '../../../context/executionStore'
import { useOSStore } from '../../../context/OSStore'
import { Plus, X, Check, Pencil, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import './ExecutePages.css'

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const PRIORITY_COLOR = { critical: 'var(--danger)', high: 'var(--expense)', medium: 'var(--warning)', low: 'var(--text-muted)' }
const PRIORITY_BG    = { critical: 'rgba(214,48,49,0.12)', high: 'var(--expense-dim)', medium: 'var(--warning-dim)', low: 'var(--bg-elevated)' }

const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done',        label: 'Done' },
]

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, loading, fetchAllTasks, toggleTaskDone, deleteTask, calculateScore } = useExecutionStore()
  const { calculateScore: calcOSScore } = useOSStore()
  const [filter, setFilter]   = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (user) fetchAllTasks(user.id)
  }, [user?.id])

  const filtered = tasks
    .filter(t => filter === 'all' ? true : t.status === filter)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  async function handleToggle(task) {
    await toggleTaskDone(task)
    calcOSScore(user.id)
  }

  async function handleDelete(task) {
    await deleteTask(task.id)
    toast.success('Task deleted')
    setDeleteTarget(null)
    calcOSScore(user.id)
  }

  return (
    <div className="execute-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>All Tasks</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Filter pills */}
      <div className="tasks-toolbar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`task-filter-pill ${filter === f.key ? 'task-filter-pill--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', opacity: 0.7 }}>
              {f.key === 'all' ? tasks.length : tasks.filter(t => t.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {loading.tasks ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div className="skeleton" style={{ width: '55%', height: '13px' }} />
                <div className="skeleton" style={{ width: '30%', height: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">✅</div>
          <h4>{filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}</h4>
          <p>{filter === 'all' ? 'Add your first task to start executing' : 'Try a different filter'}</p>
          {filter === 'all' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {filtered.map(task => (
            <div key={task.id} className="card exec-task-full">
              <div className="exec-task-full__header">
                <button
                  className={`task-check ${task.status === 'done' ? 'task-check--done' : ''}`}
                  onClick={() => handleToggle(task)}
                >
                  {task.status === 'done' && <span className="task-check__tick">✓</span>}
                </button>
                <div className="exec-task-full__info">
                  <span className={`exec-task-full__title ${task.status === 'done' ? 'exec-task-full__title--done' : ''}`}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="exec-task-full__desc">{task.description}</span>
                  )}
                  <div className="exec-task-full__meta">
                    <span
                      className="badge"
                      style={{ background: PRIORITY_BG[task.priority], color: PRIORITY_COLOR[task.priority], fontSize: '0.68rem' }}
                    >
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Calendar size={11} />
                        {format(new Date(task.due_date), 'dd MMM')}
                      </span>
                    )}
                    {task.is_recurring && (
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>🔄 {task.recurrence}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button className="icon-action-btn" onClick={() => setEditTask(task)}><Pencil size={12} /></button>
                  <button className="icon-action-btn icon-action-btn--danger" onClick={() => setDeleteTarget(task)}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="task-add-fab" onClick={() => setShowAdd(true)}>
        <Plus size={22} />
      </button>

      {showAdd    && <TaskFormModal userId={user.id} onClose={() => setShowAdd(false)} />}
      {editTask   && <TaskFormModal userId={user.id} existing={editTask} onClose={() => setEditTask(null)} />}
      {deleteTarget && (
        <DeleteModal
          label={deleteTarget.title}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── Task Form Modal ───────────────────────────────────────────
function TaskFormModal({ userId, existing, onClose }) {
  const { addTask, updateTask, calculateScore } = useExecutionStore()
  const { calculateScore: calcOS } = useOSStore()

  const [form, setForm] = useState({
    title:       existing?.title       || '',
    description: existing?.description || '',
    priority:    existing?.priority    || 'medium',
    status:      existing?.status      || 'pending',
    due_date:    existing?.due_date    || format(new Date(), 'yyyy-MM-dd'),
    is_recurring: existing?.is_recurring || false,
    recurrence:  existing?.recurrence  || 'daily',
  })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setLoading(true)
    try {
      const payload = { ...form, user_id: userId, recurrence: form.is_recurring ? form.recurrence : null }
      if (existing) {
        await updateTask(existing.id, payload)
        toast.success('Task updated')
      } else {
        await addTask(payload)
        toast.success('Task added ✅')
      }
      calcOS(userId)
      onClose()
    } catch (e) { toast.error(e.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Task' : 'New Task'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="What needs to be done?" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" rows={2} placeholder="Add details…" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">⚪ Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={e => set('is_recurring', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
              />
              Recurring task
            </label>
            {form.is_recurring && (
              <select className="form-select" style={{ flex: 1 }} value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> {existing ? 'Update Task' : 'Add Task'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ label, onConfirm, onClose }) {
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
          <h3>Delete Task</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Delete <strong style={{ color: 'var(--text-primary)' }}>{label}</strong>? This cannot be undone.
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
