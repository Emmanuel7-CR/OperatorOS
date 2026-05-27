import { useOSStore } from '../../context/OSStore'
import { useRealtime } from '../../context/RealtimeProvider'
import { useAuth } from '../../context/AuthContext'
import { Menu, Zap } from 'lucide-react'
import { getGrade } from '../layout/OSShell'
import { format } from 'date-fns'
import './ScoreBar.css'

const GRADE_LABELS = {
  elite: 'ELITE',
  high:  'STRONG',
  mid:   'BUILDING',
  low:   'WEAK',
  none:  '—',
}

export function ScoreBar({ onMenuClick }) {
  const { todayScore, scoreBreakdown, scoreLoading } = useOSStore()
  const { connected } = useRealtime()
  const { profile } = useAuth()
  const grade = getGrade(todayScore)
  const today = format(new Date(), 'EEE, MMM d')

  const pct = todayScore ?? 0

  return (
    <header className="score-bar">
      {/* Mobile menu button */}
      <button
        className="btn btn-icon btn-ghost score-bar__menu"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      {/* Brand — desktop only */}
      <div className="score-bar__brand">
        <div className="os-brand__icon" style={{ width: '26px', height: '26px', borderRadius: '7px' }}>
          <Zap size={13} />
        </div>
        <span className="score-bar__brand-name">OperatorOS</span>
      </div>

      {/* Center: score track */}
      <div className="score-bar__center">
        <div className="score-track">
          <div
            className="score-track__fill"
            style={{ width: `${pct}%` }}
            data-grade={grade}
          />
        </div>
        {scoreBreakdown && (
          <div className="score-bar__breakdown">
            <BreakdownPip label="EX" value={scoreBreakdown.execution_score}  max={40} color="var(--execution)" />
            <BreakdownPip label="DI" value={scoreBreakdown.discipline_score} max={35} color="var(--accent-bright)" />
            <BreakdownPip label="GR" value={scoreBreakdown.growth_score}     max={15} color="var(--growth)" />
            <BreakdownPip label="AW" value={scoreBreakdown.awareness_score}  max={10} color="var(--finance)" />
          </div>
        )}
      </div>

      {/* Right: score number + date */}
      <div className="score-bar__right">
        <div className="score-bar__meta">
          <span className="score-bar__date">
            {today}
            <span
              className="rt-dot"
              title={connected ? 'Live' : 'Disconnected'}
              style={{ background: connected ? 'var(--income)' : 'var(--expense)' }}
            />
          </span>
          <span className="score-bar__grade" data-grade={grade}>
            {GRADE_LABELS[grade]}
          </span>
        </div>
        <div className="score-bar__number" data-grade={grade}>
          {scoreLoading ? '…' : (todayScore ?? 0)}
        </div>
      </div>
    </header>
  )
}

function BreakdownPip({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="breakdown-pip" title={`${label}: ${value}/${max}`}>
      <div className="breakdown-pip__bar">
        <div className="breakdown-pip__fill" style={{ height: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
