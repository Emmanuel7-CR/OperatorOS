import { Link } from 'react-router-dom'
import { Zap, CheckSquare, Wallet, TrendingUp, Target, ArrowRight, Shield } from 'lucide-react'
import './LandingPage.css'

const MODULES = [
  {
    icon: <Wallet size={20} />,
    color: 'var(--finance)',
    dim: 'var(--finance-dim)',
    label: 'Finance',
    title: 'VaultWise Module',
    desc: 'Track every naira. Budget by category. Watch your savings grow.',
  },
  {
    icon: <CheckSquare size={20} />,
    color: 'var(--execution)',
    dim: 'var(--execution-dim)',
    label: 'Execute',
    title: 'Execution Module',
    desc: 'Tasks, habits, and streaks. Discipline scored daily. No excuses.',
  },
  {
    icon: <TrendingUp size={20} />,
    color: 'var(--growth)',
    dim: 'var(--growth-dim)',
    label: 'Growth',
    title: 'Growth Module',
    desc: 'Log every outreach. Track your pipeline. Build momentum daily.',
  },
  {
    icon: <Target size={20} />,
    color: 'var(--vision)',
    dim: 'var(--vision-dim)',
    label: 'Vision',
    title: 'Vision Module',
    desc: 'Define your dream life. Set milestones. Measure your progress.',
  },
]

const SCORE_ITEMS = [
  { weight: 40, label: 'Execution',  desc: 'Tasks completed vs tasks due today', color: 'var(--execution)' },
  { weight: 35, label: 'Discipline', desc: 'Habits completed vs habits scheduled', color: 'var(--accent-bright)' },
  { weight: 15, label: 'Growth',     desc: 'Outreach logged vs daily target', color: 'var(--growth)' },
  { weight: 10, label: 'Awareness',  desc: 'Financial transactions logged today', color: 'var(--finance)' },
]

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── Nav ── */}
      <nav className="landing-nav card-glass">
        <div className="landing-nav__brand">
          <div className="os-brand__icon landing-nav__icon"><Zap size={15} /></div>
          <span className="landing-nav__name">OperatorOS</span>
        </div>
        <div className="landing-nav__actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Access</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero__eyebrow">
          <span className="badge badge-accent">
            <Zap size={10} /> Discipline Execution System
          </span>
        </div>

        <h1 className="landing-hero__title">
          Operate your life<br />
          <span className="landing-hero__title--accent">like a system.</span>
        </h1>

        <p className="landing-hero__sub">
          OperatorOS is a unified personal operating system. Track your finances,
          execute your tasks, log your outreach, and measure your discipline — all
          in one place, scored daily.
        </p>

        <div className="landing-hero__cta">
          <Link to="/signup" className="btn btn-primary btn-xl">
            Access the OS <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">
            Sign in
          </Link>
        </div>

        {/* Score preview */}
        <div className="hero-score-preview card">
          <div className="hero-score-preview__top">
            <span className="hero-score-preview__label">Daily Execution Score</span>
            <span className="hero-score-preview__grade">STRONG</span>
          </div>
          <div className="hero-score-preview__number">78</div>
          <div className="hero-score-track">
            <div className="hero-score-track__fill" style={{ width: '78%' }} />
          </div>
          <div className="hero-score-preview__pips">
            {SCORE_ITEMS.map(item => (
              <div key={item.label} className="hero-pip">
                <div className="hero-pip__bar">
                  <div
                    className="hero-pip__fill"
                    style={{
                      height: `${Math.round((item.weight * 0.85))}%`,
                      background: item.color
                    }}
                  />
                </div>
                <span className="hero-pip__label">{item.label.slice(0,2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="landing-section">
        <div className="landing-section__header">
          <h2>Four modules. One system.</h2>
          <p>Every module feeds your daily score. The OS connects them all.</p>
        </div>

        <div className="landing-modules">
          {MODULES.map(mod => (
            <div key={mod.label} className="landing-module card card-hover">
              <div
                className="landing-module__icon"
                style={{ background: mod.dim, color: mod.color }}
              >
                {mod.icon}
              </div>
              <div className="landing-module__content">
                <span className="badge" style={{ background: mod.dim, color: mod.color, marginBottom: '6px' }}>
                  {mod.label}
                </span>
                <h4>{mod.title}</h4>
                <p>{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Discipline Score System ── */}
      <section className="landing-section">
        <div className="landing-section__header">
          <h2>Your score tells no lies.</h2>
          <p>Every action you take — or don't — moves your score. No manual ratings. No self-deception.</p>
        </div>

        <div className="landing-score-breakdown card">
          <div className="landing-score-breakdown__total">
            <span className="landing-score-breakdown__total-label">Total Score</span>
            <span className="landing-score-breakdown__total-max">100 pts</span>
          </div>
          {SCORE_ITEMS.map(item => (
            <div key={item.label} className="score-breakdown-row">
              <div className="score-breakdown-row__info">
                <span className="score-breakdown-row__label">{item.label}</span>
                <span className="score-breakdown-row__desc">{item.desc}</span>
              </div>
              <div className="score-breakdown-row__right">
                <div className="score-breakdown-row__bar">
                  <div
                    className="score-breakdown-row__fill"
                    style={{ width: `${item.weight}%`, background: item.color }}
                  />
                </div>
                <span
                  className="score-breakdown-row__pts"
                  style={{ color: item.color }}
                >
                  {item.weight}pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-cta__inner card">
          <div className="landing-cta__icon"><Zap size={28} /></div>
          <h2>Ready to operate?</h2>
          <p>Free to use. No subscriptions. Your data stays in your Supabase project.</p>
          <Link to="/signup" className="btn btn-primary btn-xl">
            Start Operating <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__brand">
          <Zap size={14} />
          <span>OperatorOS</span>
        </div>
        <div className="landing-footer__links">
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Get access</Link>
        </div>
        <p className="landing-footer__copy">Built for operators. Not spectators.</p>
      </footer>
    </div>
  )
}
