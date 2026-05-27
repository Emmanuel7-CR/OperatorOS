import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Sliders, Shield, LogOut, Check, Zap } from 'lucide-react'
import './SettingsPage.css'

const CURRENCIES = [
  { code: 'NGN', label: '₦ Nigerian Naira' },
  { code: 'USD', label: '$ US Dollar' },
]

export default function SettingsPage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [form, setForm]   = useState({ full_name: '', currency: 'NGN', daily_task_target: 5, daily_outreach_target: 2 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setForm({
      full_name:             profile.full_name             || '',
      currency:              profile.currency              || 'NGN',
      daily_task_target:     profile.daily_task_target     || 5,
      daily_outreach_target: profile.daily_outreach_target || 2,
    })
  }, [profile])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile saved')
    } catch (e) {
      toast.error(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
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
            <input
              className="form-input"
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.5 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              className="form-select"
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* OS Targets */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
            <Sliders size={16} />
          </div>
          <h3>Daily Targets</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          These targets determine how your execution score is calculated each day.
        </p>

        <div className="settings-fields">
          <div className="form-group">
            <label className="form-label">Daily Task Target</label>
            <input
              className="form-input"
              type="number"
              min="1" max="20"
              value={form.daily_task_target}
              onChange={e => set('daily_task_target', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Daily Outreach Target</label>
            <input
              className="form-input"
              type="number"
              min="1" max="50"
              value={form.daily_outreach_target}
              onChange={e => set('daily_outreach_target', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </section>

      {/* Save button */}
      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? <span className="btn-spinner" />
          : <><Check size={16} /> Save Settings</>
        }
      </button>

      {/* About */}
      <section className="settings-section card">
        <div className="settings-section__header">
          <div className="settings-section__icon" style={{ background: 'var(--finance-dim)', color: 'var(--finance)' }}>
            <Zap size={16} />
          </div>
          <h3>About OperatorOS</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '0.84rem' }}>Version 1.0.0 — Phase 3 Core Shell</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Your data is stored securely in Supabase with Row Level Security enabled on all tables.
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
