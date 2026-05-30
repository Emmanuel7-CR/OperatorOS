import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOSStore } from '../../context/OSStore'
import { supabase } from '../../services/supabase'
import { format } from 'date-fns'
import {
  Wallet, CheckSquare, TrendingUp, Target,
  ArrowRight, Zap, ChevronRight, AlertTriangle
} from 'lucide-react'
import { getGrade } from '../../components/layout/OSShell'
import './OSDashboard.css'

export default function OSDashboard() {
  const { user, profile } = useAuth()
  const { todayScore, scoreBreakdown, calculateScore, weekScores } = useOSStore()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const currency = profile?.currency || 'NGN'
  const symbol   = currency === 'USD' ? '$' : '₦'
  const firstName = profile?.full_name?.split(' ')[0] || 'Operator'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    if (!user) return
    calculateScore(user.id)
    fetchSummary()
  }, [user?.id])

  async function fetchSummary() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = `${today.slice(0, 7)}-01`

      const [taskRes, habitRes, financeRes, outreachRes] = await Promise.all([
        supabase.from('tasks')
          .select('id, status, priority, due_date')
          .eq('user_id', user.id)
          .neq('status', 'cancelled'),
        supabase.from('habits')
          .select('id, name, icon, current_streak, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase.from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', today),
        supabase.from('outreach_logs')
          .select('id, status')
          .eq('user_id', user.id)
          .gte('contacted_at', `${today}T00:00:00`),
      ])

      const tasks     = taskRes.data    || []
      const habits    = habitRes.data   || []
      const txns      = financeRes.data || []
      const outreach  = outreachRes.data || []

      const todayTasks  = tasks.filter(t => t.due_date === today)
      const doneTasks   = todayTasks.filter(t => t.status === 'done')
      const income      = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses    = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const topStreak   = habits.sort((a, b) => b.current_streak - a.current_streak)[0]

      setSummary({
        tasks:     { total: todayTasks.length, done: doneTasks.length },
        habits:    { total: habits.length, topStreak },
        finance:   { income, expenses, balance: income - expenses },
        outreach:  { today: outreach.length },
      })
    } catch (e) {
      console.error('Summary fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const grade = getGrade(todayScore)

  return (
    <div className="os-dashboard">

      {/* Header */}
      <div className="os-dashboard__header">
        <div>
          <p className="os-dashboard__greeting">{greeting}, {firstName}</p>
          <h1 className="os-dashboard__title">Command Centre</h1>
        </div>
        <div className="os-dashboard__date">
          {format(new Date(), 'EEE d MMM')}
        </div>
      </div>

      {/* Score Hero */}
      <div className="score-hero card animate-fade-in" data-grade={grade}>
        <div className="score-hero__left">
          <span className="score-hero__label">Execution Score</span>
          <div className="score-hero__number" data-grade={grade}>
            {todayScore ?? 0}
            <span className="score-hero__max">/100</span>
          </div>
          <span className="score-hero__grade" data-grade={grade}>
            {grade === 'elite' ? '🔥 Elite Operator' :
             grade === 'high'  ? '💪 Strong Day' :
             grade === 'mid'   ? '📈 Building Momentum' :
                                 '⚠️ Needs Work'}
          </span>
        </div>

        <div className="score-hero__right">
          {scoreBreakdown ? (
            <div className="score-hero__breakdown">
              {[
                { label: 'Execute', val: scoreBreakdown.execution_score,  max: 40,  color: 'var(--execution)' },
                { label: 'Discipline', val: scoreBreakdown.discipline_score, max: 35, color: 'var(--accent-bright)' },
                { label: 'Growth', val: scoreBreakdown.growth_score,     max: 15,  color: 'var(--growth)' },
                { label: 'Aware',  val: scoreBreakdown.awareness_score,  max: 10,  color: 'var(--finance)' },
              ].map(item => (
                <div key={item.label} className="score-hero__item">
                  <div className="score-hero__item-track">
                    <div
                      className="score-hero__item-fill"
                      style={{
                        width: `${Math.round((item.val / item.max) * 100)}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <div className="score-hero__item-meta">
                    <span>{item.label}</span>
                    <span style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>
                      {item.val}/{item.max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="score-hero__empty">
              <Zap size={28} />
              <span>Complete tasks to build your score</span>
            </div>
          )}
        </div>
      </div>

      {/* Module Summary Grid */}
      <div className="module-grid">

        {/* Finance */}
        <Link to="/app/finance" className="module-card card card-hover">
          <div className="module-card__header">
            <div className="module-card__icon" style={{ background: 'var(--finance-dim)', color: 'var(--finance)' }}>
              <Wallet size={18} />
            </div>
            <span className="module-card__name">Finance</span>
            <ChevronRight size={14} className="module-card__arrow" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '36px', marginTop: '8px' }} />
          ) : summary ? (
            <>
              <div className="module-card__stat" style={{ color: 'var(--income)' }}>
                {symbol}{summary.finance.income.toLocaleString()}
                <span className="module-card__stat-label"> income</span>
              </div>
              <div className="module-card__sub">
                <span style={{ color: 'var(--expense)' }}>
                  -{symbol}{summary.finance.expenses.toLocaleString()} spent
                </span>
                <span style={{ color: summary.finance.balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                  {symbol}{Math.abs(summary.finance.balance).toLocaleString()} {summary.finance.balance >= 0 ? 'saved' : 'deficit'}
                </span>
              </div>
            </>
          ) : null}
        </Link>

        {/* Execute */}
        <Link to="/app/execute" className="module-card card card-hover">
          <div className="module-card__header">
            <div className="module-card__icon" style={{ background: 'var(--execution-dim)', color: 'var(--execution)' }}>
              <CheckSquare size={18} />
            </div>
            <span className="module-card__name">Execute</span>
            <ChevronRight size={14} className="module-card__arrow" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '36px', marginTop: '8px' }} />
          ) : summary ? (
            <>
              <div className="module-card__stat" style={{ color: 'var(--execution)' }}>
                {summary.tasks.done}/{summary.tasks.total}
                <span className="module-card__stat-label"> tasks today</span>
              </div>
              <div className="module-card__sub">
                {summary.tasks.total === 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>No tasks due today</span>
                ) : summary.tasks.done === summary.tasks.total ? (
                  <span style={{ color: 'var(--success)' }}>✓ All tasks complete</span>
                ) : (
                  <span style={{ color: 'var(--warning)' }}>
                    {summary.tasks.total - summary.tasks.done} remaining
                  </span>
                )}
              </div>
            </>
          ) : null}
        </Link>

        {/* Growth */}
        <Link to="/app/growth" className="module-card card card-hover">
          <div className="module-card__header">
            <div className="module-card__icon" style={{ background: 'var(--growth-dim)', color: 'var(--growth)' }}>
              <TrendingUp size={18} />
            </div>
            <span className="module-card__name">Growth</span>
            <ChevronRight size={14} className="module-card__arrow" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '36px', marginTop: '8px' }} />
          ) : summary ? (
            <>
              <div className="module-card__stat" style={{ color: 'var(--growth)' }}>
                {summary.outreach.today}
                <span className="module-card__stat-label"> outreach today</span>
              </div>
              <div className="module-card__sub">
                {summary.outreach.today === 0
                  ? <span style={{ color: 'var(--text-muted)' }}>No contacts logged yet</span>
                  : <span style={{ color: 'var(--success)' }}>+{summary.outreach.today} logged</span>
                }
              </div>
            </>
          ) : null}
        </Link>

        {/* Vision */}
        <Link to="/app/vision" className="module-card card card-hover">
          <div className="module-card__header">
            <div className="module-card__icon" style={{ background: 'var(--vision-dim)', color: 'var(--vision)' }}>
              <Target size={18} />
            </div>
            <span className="module-card__name">Vision</span>
            <ChevronRight size={14} className="module-card__arrow" />
          </div>
          <div className="module-card__stat" style={{ color: 'var(--vision)' }}>
            Dream Board
          </div>
          <div className="module-card__sub">
            <span style={{ color: 'var(--text-muted)' }}>Define your targets</span>
          </div>
        </Link>

      </div>

      {/* Week score sparkline */}
      {weekScores.length > 1 && (
        <div className="week-scores card animate-fade-in">
          <span className="week-scores__label">7-Day Score History</span>
          <div className="week-scores__bars">
            {weekScores.map((s, i) => {
              const g = getGrade(s.score)
              return (
                <div key={i} className="week-bar" title={`${format(new Date(s.date), 'EEE')} — ${s.score}`}>
                  <div
                    className="week-bar__fill"
                    data-grade={g}
                    style={{ height: `${Math.max(4, s.score)}%` }}
                  />
                  <span className="week-bar__day">
                    {format(new Date(s.date), 'EEE').slice(0, 1)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Insight panel — warnings */}
      {summary && !loading && (
        <InsightPanel summary={summary} scoreBreakdown={scoreBreakdown} profile={profile} />
      )}

    </div>
  )
}

function InsightPanel({ summary, scoreBreakdown, profile }) {
  const insights = []

  if (summary.tasks.total > 0 && summary.tasks.done < summary.tasks.total) {
    insights.push({
      type: 'warning',
      icon: <AlertTriangle size={14} />,
      text: `${summary.tasks.total - summary.tasks.done} task${summary.tasks.total - summary.tasks.done > 1 ? 's' : ''} still pending today`,
    })
  }
  if (summary.outreach.today === 0) {
    insights.push({
      type: 'warning',
      icon: <AlertTriangle size={14} />,
      text: 'No outreach logged today — Growth score is 0',
    })
  }
  if (!scoreBreakdown?.finance_logged) {
    insights.push({
      type: 'info',
      icon: <Zap size={14} />,
      text: 'Log a transaction today to earn your Awareness points',
    })
  }
  if (summary.finance.balance < 0) {
    insights.push({
      type: 'danger',
      icon: <AlertTriangle size={14} />,
      text: 'Monthly expenses exceed income — review your budget',
    })
  }

  if (insights.length === 0) return (
    <div className="insight-panel card">
      <span className="insight-panel__title">System Status</span>
      <p style={{ color: 'var(--success)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={14} /> All systems operating. Keep executing.
      </p>
    </div>
  )

  return (
    <div className="insight-panel card animate-fade-in">
      <span className="insight-panel__title">OS Insights</span>
      <div className="insight-list">
        {insights.map((item, i) => (
          <div key={i} className={`insight-item insight-item--${item.type}`}>
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
