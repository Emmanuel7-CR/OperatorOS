import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useGrowthStore } from '../../../context/growthStore'
import { useOSStore } from '../../../context/OSStore'
import { outreachService } from '../../../services/growthApi'
import { Plus, X, Check, Pencil, Trash2, TrendingUp, Users, Phone, Mail, Linkedin, Twitter, Instagram, MessageCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import './GrowthPages.css'

const CHANNELS = [
  { value: 'linkedin',   label: 'LinkedIn',   icon: <Linkedin size={14} /> },
  { value: 'email',      label: 'Email',       icon: <Mail size={14} /> },
  { value: 'twitter',    label: 'Twitter/X',   icon: <Twitter size={14} /> },
  { value: 'instagram',  label: 'Instagram',   icon: <Instagram size={14} /> },
  { value: 'whatsapp',   label: 'WhatsApp',    icon: <MessageCircle size={14} /> },
  { value: 'phone',      label: 'Phone',       icon: <Phone size={14} /> },
  { value: 'in_person',  label: 'In Person',   icon: <Users size={14} /> },
  { value: 'other',      label: 'Other',       icon: <TrendingUp size={14} /> },
]

const STATUSES = [
  { value: 'sent',           label: 'Sent',           color: 'var(--text-muted)' },
  { value: 'opened',         label: 'Opened',         color: 'var(--info, #4db8ff)' },
  { value: 'replied',        label: 'Replied',        color: 'var(--growth)' },
  { value: 'meeting_booked', label: 'Meeting Booked', color: 'var(--accent-bright)' },
  { value: 'closed',         label: 'Closed ✓',       color: 'var(--income)' },
  { value: 'not_interested', label: 'Not Interested', color: 'var(--expense)' },
]

const STATUS_BG = {
  sent:           'var(--bg-elevated)',
  opened:         'rgba(77,184,255,0.12)',
  replied:        'var(--growth-dim)',
  meeting_booked: 'var(--accent-dim)',
  closed:         'var(--income-dim)',
  not_interested: 'var(--expense-dim)',
}

const CHANNEL_ICONS = {
  linkedin:  <Linkedin size={13} />,
  email:     <Mail size={13} />,
  twitter:   <Twitter size={13} />,
  instagram: <Instagram size={13} />,
  whatsapp:  <MessageCircle size={13} />,
  phone:     <Phone size={13} />,
  in_person: <Users size={13} />,
  other:     <TrendingUp size={13} />,
}

export default function OutreachPage() {
  const { user, profile } = useAuth()
  const { outreachLogs, fetchAllOutreach, upsertOutreachLocal, removeOutreachLocal, loading } = useGrowthStore()
  const { calculateScore } = useOSStore()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editLog,      setEditLog]      = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterChannel, setFilterChannel] = useState('all')

  useEffect(() => {
    if (user) fetchAllOutreach(user.id)
  }, [user?.id])

  const today = new Date().toISOString().split('T')[0]
  const todayCount = outreachLogs.filter(l => l.contacted_at?.startsWith(today)).length
  const target = profile?.daily_outreach_target || 2

  const filtered = outreachLogs.filter(l => {
    if (filterStatus  !== 'all' && l.status  !== filterStatus)  return false
    if (filterChannel !== 'all' && l.channel !== filterChannel) return false
    return true
  })

  // Pipeline counts
  const pipeline = STATUSES.reduce((acc, s) => {
    acc[s.value] = outreachLogs.filter(l => l.status === s.value).length
    return acc
  }, {})

  async function handleDelete(log) {
    try {
      await outreachService.delete(log.id)
      removeOutreachLocal(log.id)
      toast.success('Contact removed')
      setDeleteTarget(null)
      calculateScore(user.id)
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="growth-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3>Outreach CRM</h3>
          <p style={{ fontSize: '0.78rem', color: todayCount >= target ? 'var(--income)' : 'var(--text-muted)', marginTop: '2px' }}>
            {todayCount}/{target} contacts today
            {todayCount >= target && ' ✓'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Log Contact
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="pipeline-grid">
        {STATUSES.map(s => (
          <button
            key={s.value}
            className={`pipeline-pill ${filterStatus === s.value ? 'pipeline-pill--active' : ''}`}
            style={{ '--pill-color': s.color }}
            onClick={() => setFilterStatus(f => f === s.value ? 'all' : s.value)}
          >
            <span className="pipeline-pill__count">{pipeline[s.value]}</span>
            <span className="pipeline-pill__label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Channel filter */}
      <div className="tasks-toolbar" style={{ flexWrap: 'wrap' }}>
        <button
          className={`task-filter-pill ${filterChannel === 'all' ? 'task-filter-pill--active' : ''}`}
          style={filterChannel === 'all' ? { background: 'var(--growth-dim)', borderColor: 'rgba(253,203,110,0.35)', color: 'var(--growth)' } : {}}
          onClick={() => setFilterChannel('all')}
        >
          All channels
        </button>
        {CHANNELS.map(ch => (
          <button
            key={ch.value}
            className={`task-filter-pill ${filterChannel === ch.value ? 'task-filter-pill--active' : ''}`}
            style={filterChannel === ch.value ? { background: 'var(--growth-dim)', borderColor: 'rgba(253,203,110,0.35)', color: 'var(--growth)' } : {}}
            onClick={() => setFilterChannel(f => f === ch.value ? 'all' : ch.value)}
          >
            {ch.icon} {ch.label}
          </button>
        ))}
      </div>

      {/* Log list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '80px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><TrendingUp size={24} /></div>
          <h4>{filterStatus !== 'all' || filterChannel !== 'all' ? 'No results' : 'No outreach logged'}</h4>
          <p>{filterStatus !== 'all' || filterChannel !== 'all' ? 'Try clearing your filters' : 'Log your first contact to start building momentum'}</p>
          {filterStatus === 'all' && filterChannel === 'all' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Log Contact
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {filtered.map(log => {
            const statusInfo = STATUSES.find(s => s.value === log.status)
            return (
              <div key={log.id} className="outreach-card card">
                <div className="outreach-card__header">
                  <div className="outreach-card__channel">
                    {CHANNEL_ICONS[log.channel] || CHANNEL_ICONS.other}
                  </div>
                  <div className="outreach-card__info">
                    <span className="outreach-card__name">{log.contact_name}</span>
                    {log.company && <span className="outreach-card__company">{log.company}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span
                      className="badge"
                      style={{ background: STATUS_BG[log.status], color: statusInfo?.color, fontSize: '0.68rem' }}
                    >
                      {statusInfo?.label}
                    </span>
                    <button className="icon-action-btn" onClick={() => setEditLog(log)}><Pencil size={12} /></button>
                    <button className="icon-action-btn icon-action-btn--danger" onClick={() => setDeleteTarget(log)}><Trash2 size={12} /></button>
                  </div>
                </div>
                {log.subject && <p className="outreach-card__subject">{log.subject}</p>}
                {log.notes   && <p className="outreach-card__notes">{log.notes}</p>}
                <div className="outreach-card__footer">
                  <span>{format(parseISO(log.contacted_at), 'dd MMM yyyy · HH:mm')}</span>
                  {log.follow_up_at && (
                    <span style={{ color: 'var(--warning)' }}>
                      Follow up: {format(parseISO(log.follow_up_at), 'dd MMM')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="task-add-fab" style={{ background: 'var(--growth)' }} onClick={() => setShowAdd(true)}>
        <Plus size={22} />
      </button>

      {showAdd      && <OutreachFormModal userId={user.id} onClose={() => setShowAdd(false)} onSaved={log => { upsertOutreachLocal(log); calculateScore(user.id) }} />}
      {editLog      && <OutreachFormModal userId={user.id} existing={editLog} onClose={() => setEditLog(null)} onSaved={log => upsertOutreachLocal(log)} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Remove Contact</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setDeleteTarget(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Remove outreach log for <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.contact_name}</strong>? This cannot be undone.
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

function OutreachFormModal({ userId, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_name: existing?.contact_name || '',
    company:      existing?.company      || '',
    channel:      existing?.channel      || 'linkedin',
    status:       existing?.status       || 'sent',
    subject:      existing?.subject      || '',
    notes:        existing?.notes        || '',
    contacted_at: existing?.contacted_at
      ? existing.contacted_at.slice(0, 16)
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    follow_up_at: existing?.follow_up_at ? existing.follow_up_at.slice(0, 16) : '',
  })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.contact_name.trim()) { toast.error('Contact name required'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        user_id:      userId,
        follow_up_at: form.follow_up_at || null,
      }
      let saved
      if (existing) {
        saved = await outreachService.update(existing.id, payload)
        toast.success('Contact updated')
      } else {
        saved = await outreachService.create(payload)
        toast.success('Contact logged 📈')
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
          <h3>{existing ? 'Edit Contact' : 'Log Contact'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input className="form-input" type="text" placeholder="John Smith" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" type="text" placeholder="Acme Corp" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Channel</label>
              <select className="form-select" value={form.channel} onChange={e => set('channel', e.target.value)}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Subject / Message</label>
            <input className="form-input" type="text" placeholder="What did you reach out about?" value={form.subject} onChange={e => set('subject', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} placeholder="Any context or next steps…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Contacted At</label>
              <input className="form-input" type="datetime-local" value={form.contacted_at} onChange={e => set('contacted_at', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Follow Up (optional)</label>
              <input className="form-input" type="datetime-local" value={form.follow_up_at} onChange={e => set('follow_up_at', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-full" style={{ background: 'var(--growth)', color: '#07070f', fontWeight: 700 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="btn-spinner" style={{ borderTopColor: '#07070f' }} /> : <><Check size={15} /> {existing ? 'Update' : 'Log Contact'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
