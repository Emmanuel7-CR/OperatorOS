import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useFinanceStore } from '../../context/financeStore'
import toast from 'react-hot-toast'
import { User, Sliders, Tag, LogOut, Check, Zap, Trash2, Plus, X } from 'lucide-react'
import './SettingsPage.css'

const CURRENCIES = [
  { code: 'NGN', label: '₦ Nigerian Naira' },
  { code: 'USD', label: '$ US Dollar' },
]

const CAT_COLORS = ['#6c5ce7','#00b894','#e17055','#fdcb6e','#4db8ff','#fd79a8','#00cec9','#a29bfe','#55efc4','#ff9f43']
const CAT_ICONS  = ['🍕','🚌','🎮','📚','🏋️','🎁','🐾','🌿','🎵','🛠️','☕','🧴','🎯','💡','🏠','✈️']

export default function SettingsPage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { categories, fetchCategories, addCategory, deleteCategory } = useFinanceStore()

  const [form, setForm] = useState({
    full_name:             '',
    currency:              'NGN',
    daily_task_target:     5,
    daily_outreach_target: 2,
  })
  const [saving,      setSaving]      = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)
  const [newCat, setNewCat]           = useState({ name: '', icon: '🛠️', color: '#6c5ce7' })
  const [addingCat,   setAddingCat]   = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:             profile.full_name             || '',
        currency:              profile.currency              || 'NGN',
        daily_task_target:     profile.daily_task_target     || 5,
        daily_outreach_target: profile.daily_outreach_target || 2,
      })
    }
    if (user) fetchCategories(user.id)
  }, [profile, user?.id])

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Settings saved ✓')
    } catch (e) { toast.error(e.message || 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleAddCategory() {
    if (!newCat.name.trim()) { toast.error('Name required'); return }
    setAddingCat(true)
    try {
      await addCategory({ ...newCat, user_id: user.id, is_default: false })
      toast.success('Category added')
      setNewCat({ name: '', icon: '🛠️', color: '#6c5ce7' })
      setShowCatForm(false)
    } catch (e) { toast.error(e.message) }
    finally { setAddingCat(false) }
  }

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h2>Settings</h2>
        <p>Configure your OperatorOS environment</p>
      </div>

      {/* Profile */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--accent-dim)', color: 'var(--accent-bright)' }}>
            <User size={16} />
          </div>
          <h3>Profile</h3>
        </div>
        <div className="settings-fields">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" value={form.full_name} onChange={e => setF('full_name', e.target.value)} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" value={form.currency} onChange={e => setF('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Daily Targets */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
            <Sliders size={16} />
          </div>
          <h3>Daily Targets</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          These targets set how your execution score is calculated each day.
        </p>
        <div className="settings-fields">
          <div className="form-group">
            <label className="form-label">Daily Task Target</label>
            <input className="form-input" type="number" min="1" max="50" value={form.daily_task_target} onChange={e => setF('daily_task_target', parseInt(e.target.value) || 1)} />
          </div>
          <div className="form-group">
            <label className="form-label">Daily Outreach Target</label>
            <input className="form-input" type="number" min="1" max="100" value={form.daily_outreach_target} onChange={e => setF('daily_outreach_target', parseInt(e.target.value) || 1)} />
          </div>
        </div>
      </section>

      {/* Save */}
      <button className="btn btn-primary btn-full btn-lg" onClick={handleSave} disabled={saving}>
        {saving ? <span className="btn-spinner" /> : <><Check size={16} /> Save Settings</>}
      </button>

      {/* Categories */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--growth-dim)', color: 'var(--growth)' }}>
            <Tag size={16} />
          </div>
          <h3>Finance Categories</h3>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowCatForm(v => !v)}>
            <Plus size={13} /> Add
          </button>
        </div>

        {showCatForm && (
          <div className="cat-form animate-slide-up">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {CAT_ICONS.map(icon => (
                <button
                  key={icon}
                  style={{
                    width: '36px', height: '36px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                    border: `1.5px solid ${newCat.icon === icon ? newCat.color : 'var(--border)'}`,
                    background: newCat.icon === icon ? newCat.color + '22' : 'var(--bg-surface)',
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => setNewCat(c => ({ ...c, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {CAT_COLORS.map(color => (
                <button
                  key={color}
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%', background: color,
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    outline: newCat.color === color ? '2px solid white' : 'none', outlineOffset: '2px',
                  }}
                  onClick={() => setNewCat(c => ({ ...c, color }))}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                type="text" placeholder="Category name"
                value={newCat.name}
                onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-icon" onClick={handleAddCategory} disabled={addingCat}>
                {addingCat ? <span className="btn-spinner" style={{ width: '14px', height: '14px' }} /> : <Check size={15} />}
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCatForm(false)}>
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="cat-list">
          {categories.map(cat => (
            <div key={cat.id || cat.name} className="cat-list-item">
              <div className="cat-list-item__icon" style={{ background: cat.color + '22', color: cat.color }}>
                {cat.icon}
              </div>
              <span className="cat-list-item__name">{cat.name}</span>
              {cat.is_default ? (
                <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: '0.68rem' }}>Default</span>
              ) : (
                <button
                  className="icon-action-btn icon-action-btn--danger"
                  style={{ marginLeft: 'auto' }}
                  onClick={async () => { await deleteCategory(cat.id); toast.success('Category removed') }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--finance-dim)', color: 'var(--finance)' }}>
            <Zap size={16} />
          </div>
          <h3>About OperatorOS</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '0.84rem' }}>Version 1.0.0 — All phases complete</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            All data is stored securely in Supabase with Row Level Security on every table.
            Finance · Execute · Growth · Vision — one unified OS.
          </p>
        </div>
      </section>

      {/* Sign out */}
      <button className="btn btn-danger btn-full" onClick={signOut}>
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  )
}
