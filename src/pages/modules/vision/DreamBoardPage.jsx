import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { visionService } from '../../../services/visionApi'
import { Plus, X, Check, Pencil, Trash2, Target, Star, Trophy, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import './VisionPages.css'

const CATEGORIES = [
  { value: 'wealth',        label: 'Wealth',        icon: '💰', color: '#fdcb6e' },
  { value: 'health',        label: 'Health',        icon: '❤️', color: '#ff5f7e' },
  { value: 'relationships', label: 'Relationships', icon: '👥', color: '#fd79a8' },
  { value: 'career',        label: 'Career',        icon: '🚀', color: '#4db8ff' },
  { value: 'lifestyle',     label: 'Lifestyle',     icon: '🌴', color: '#55efc4' },
  { value: 'impact',        label: 'Impact',        icon: '⚡', color: '#a29bfe' },
  { value: 'general',       label: 'General',       icon: '🎯', color: '#b2bec3' },
]

const TYPES = [
  { value: 'goal',        label: 'Goal',        icon: <Target size={14} /> },
  { value: 'milestone',   label: 'Milestone',   icon: <Trophy size={14} /> },
  { value: 'affirmation', label: 'Affirmation', icon: <MessageSquare size={14} /> },
]

export default function DreamBoardPage() {
  const { user } = useAuth()
  const [assets,       setAssets]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showAdd,      setShowAdd]      = useState(false)
  const [editAsset,    setEditAsset]    = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterCat,    setFilterCat]    = useState('all')

  useEffect(() => {
    if (user) fetchAssets()
  }, [user?.id])

  async function fetchAssets() {
    setLoading(true)
    try {
      const data = await visionService.getAll(user.id)
      setAssets(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const displayed = filterCat === 'all' ? assets : assets.filter(a => a.category === filterCat)
  const achieved  = assets.filter(a => a.is_achieved).length
  const total     = assets.length

  async function handleDelete(asset) {
    try {
      await visionService.delete(asset.id)
      setAssets(a => a.filter(x => x.id !== asset.id))
      toast.success('Removed from board')
      setDeleteTarget(null)
    } catch (e) { toast.error(e.message) }
  }

  async function handleToggleAchieved(asset) {
    try {
      const updated = await visionService.update(asset.id, {
        is_achieved: !asset.is_achieved,
        achieved_at: !asset.is_achieved ? new Date().toISOString() : null,
      })
      setAssets(a => a.map(x => x.id === asset.id ? updated : x))
      if (!asset.is_achieved) toast.success('🏆 Marked as achieved!')
    } catch (e) { toast.error(e.message) }
  }

  function getCatInfo(value) {
    return CATEGORIES.find(c => c.value === value) || CATEGORIES[6]
  }

  return (
    <div className="vision-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3>Dream Board</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {achieved}/{total} achieved
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}
          style={{ background: 'var(--vision)' }}>
          <Plus size={15} /> Add Vision
        </button>
      </div>

      {/* Category filter */}
      <div className="tasks-toolbar" style={{ flexWrap: 'wrap' }}>
        <button
          className={`task-filter-pill ${filterCat === 'all' ? 'vision-pill--active' : ''}`}
          onClick={() => setFilterCat('all')}
        >
          All
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', opacity: 0.7 }}>{total}</span>
        </button>
        {CATEGORIES.map(cat => {
          const count = assets.filter(a => a.category === cat.value).length
          if (count === 0) return null
          return (
            <button
              key={cat.value}
              className={`task-filter-pill ${filterCat === cat.value ? 'vision-pill--active' : ''}`}
              style={filterCat === cat.value ? { '--vision-color': cat.color, background: cat.color + '20', borderColor: cat.color + '60', color: cat.color } : {}}
              onClick={() => setFilterCat(f => f === cat.value ? 'all' : cat.value)}
            >
              {cat.icon} {cat.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', opacity: 0.7 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="vision-grid">
          {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height: '140px' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><Star size={24} /></div>
          <h4>Your dream board is empty</h4>
          <p>Define your vision — goals, milestones, and affirmations that drive you forward</p>
          <button className="btn btn-primary btn-sm" style={{ background: 'var(--vision)' }} onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Your First Vision
          </button>
        </div>
      ) : (
        <div className="vision-grid">
          {displayed.map(asset => {
            const cat  = getCatInfo(asset.category)
            const type = TYPES.find(t => t.value === asset.type)
            return (
              <div
                key={asset.id}
                className={`vision-card card ${asset.is_achieved ? 'vision-card--achieved' : ''}`}
                style={{ '--vision-cat-color': cat.color }}
              >
                <div className="vision-card__header">
                  <span className="vision-card__cat-icon">{cat.icon}</span>
                  <span className="badge" style={{ background: cat.color + '20', color: cat.color, fontSize: '0.65rem' }}>
                    {cat.label}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {type?.icon} {type?.label}
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <button className="icon-action-btn" onClick={() => setEditAsset(asset)}>
                      <Pencil size={11} />
                    </button>
                    <button className="icon-action-btn icon-action-btn--danger" onClick={() => setDeleteTarget(asset)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <div className="vision-card__body">
                  <h4 className="vision-card__title">{asset.title}</h4>
                  {asset.description && <p className="vision-card__desc">{asset.description}</p>}
                  {asset.target_date && (
                    <span className="vision-card__date">
                      🗓 {new Date(asset.target_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {asset.target_value != null && (
                    <span className="vision-card__target">
                      Target: <strong>{Number(asset.target_value).toLocaleString()}</strong>
                    </span>
                  )}
                </div>

                <button
                  className={`vision-card__achieve-btn ${asset.is_achieved ? 'vision-card__achieve-btn--done' : ''}`}
                  style={asset.is_achieved ? { background: cat.color + '22', color: cat.color, borderColor: cat.color + '50' } : {}}
                  onClick={() => handleToggleAchieved(asset)}
                >
                  {asset.is_achieved ? '🏆 Achieved' : '○ Mark achieved'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button
        className="task-add-fab"
        style={{ background: 'var(--vision)', boxShadow: '0 4px 20px rgba(162,155,254,0.4), 0 4px 18px rgba(0,0,0,0.4)' }}
        onClick={() => setShowAdd(true)}
      >
        <Plus size={22} />
      </button>

      {showAdd     && <VisionFormModal userId={user.id} onSaved={a => { setAssets(x => [a, ...x]); }} onClose={() => setShowAdd(false)} />}
      {editAsset   && <VisionFormModal userId={user.id} existing={editAsset} onSaved={a => setAssets(x => x.map(i => i.id === a.id ? a : i))} onClose={() => setEditAsset(null)} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Remove Vision</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setDeleteTarget(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Remove <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.title}</strong> from your dream board?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-full" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger btn-full" onClick={() => handleDelete(deleteTarget)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VisionFormModal({ userId, existing, onSaved, onClose }) {
  const [form, setForm] = useState({
    title:        existing?.title        || '',
    description:  existing?.description  || '',
    category:     existing?.category     || 'general',
    type:         existing?.type         || 'goal',
    target_date:  existing?.target_date  || '',
    target_value: existing?.target_value != null ? String(existing.target_value) : '',
  })
  const [loading, setLoading] = useState(false)
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        user_id:      userId,
        target_value: form.target_value ? parseFloat(form.target_value) : null,
        target_date:  form.target_date || null,
      }
      let saved
      if (existing) {
        saved = await visionService.update(existing.id, payload)
        toast.success('Vision updated')
      } else {
        saved = await visionService.create(payload)
        toast.success('Vision added to board 🎯')
      }
      onSaved(saved)
      onClose()
    } catch (e) { toast.error(e.message || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{existing ? 'Edit Vision' : 'Add Vision'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="What do you want to achieve?" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} placeholder="Why is this important to you?" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input className="form-input" type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Value</label>
              <input className="form-input" type="number" inputMode="decimal" placeholder="e.g. 1000000" value={form.target_value} onChange={e => set('target_value', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-full"
            style={{ background: 'var(--vision)', color: 'white', fontWeight: 700 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : <><Check size={15} /> {existing ? 'Update' : 'Add to Board'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
