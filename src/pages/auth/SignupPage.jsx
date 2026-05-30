import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import './AuthPages.css'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }

  function validate() {
    const e = {}
    if (!form.fullName.trim())  e.fullName = 'Full name is required'
    if (!form.email)            e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)         e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const pwStrength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length > 0 ? 1 : 0

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName)
      toast.success('Account created. Check your email to confirm.')
      navigate('/login')
    } catch (e) {
      toast.error(e.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
      </div>

      <div className="auth-container">
        <div className="auth-card animate-scale-in">
          <div className="auth-brand">
            <div className="os-brand__icon auth-brand__icon"><Zap size={18} /></div>
            <span className="auth-brand__name">OperatorOS</span>
          </div>

          <div className="auth-header">
            <h1>Get access</h1>
            <p>Create your operator account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                type="text"
                placeholder="Alex Johnson"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                autoComplete="name"
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '46px' }}
                />
                <button type="button" className="input-action" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  {[1,2,3].map(i => (
                    <div key={i} className={`pw-strength__bar ${pwStrength >= i ? `pw-strength__bar--${pwStrength}` : ''}`} />
                  ))}
                  <span className="pw-strength__label">{['','Weak','Good','Strong'][pwStrength]}</span>
                </div>
              )}
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className={`form-input ${errors.confirm ? 'form-input--error' : ''}`}
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 'var(--sp-2)' }}
            >
              {loading
                ? <span className="btn-spinner" />
                : <> Create account <ArrowRight size={17} /></>
              }
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
