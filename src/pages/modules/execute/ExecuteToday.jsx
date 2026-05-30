import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useExecutionStore } from '../../../context/executionStore'
import { useOSStore } from '../../../context/OSStore'
import { Link } from 'react-router-dom'
import { CheckSquare, Flame, ArrowRight, Plus, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { getGrade } from '../../../components/layout/OSShell'
import './ExecutePages.css'

const PRIORITY_COLOR = {
  critical: 'var(--danger)',
  high:     'var(--expense)',
  medium:   'var(--warning)',
  low:      'var(--text-muted)',
}

const PRIORITY_LABEL = {
  critical: '🔴 Critical',
  high:     '🟠 High',
  medium:   '🟡 Medium',
  low:      '⚪ Low',
}

export default function ExecuteToday() {
  const { user } = useAuth()
  const {
    tasks, habits, habitCompletions,
    loading, fetchTodayTasks, fetchHabits,
    fetchTodayCompletions, toggleTaskDone,
    completeHabit, uncompleteHabit, isCompletedToday,
    getTodayStats,
  } = useExecutionStore()
  const { todayScore, scoreBreakdown, calculateScore } = useOSStore()

  useEffect(() => {
    if (!user) return
    fetchTodayTasks(user.id)
    fetchHabits(user.id)
    fetchTodayCompletions(user.id)
  }, [user?.id])

  const stats = getTodayStats()
  const grade = getGrade(todayScore)
  const activeHabits = habits.filter(h => h.is_active)

  async function handleToggleTask(task) {
    await toggleTaskDone(task)
    calculateScore(user.id)
  }

  async function handleHabitToggle(habit) {
    const done = isCompletedToday(habit.id)
    if (done) await uncompleteHabit(habit.id, user.id)
    else       await completeHabit(habit.id, user.id)
    calculateScore(user.id)
  }

  return (
    <div className="execute-page">

      {/* Score summary */}
      <div className="exec-score-card card" data-grade={grade}>
        <div className="exec-score-card__left">
          <span className="exec-score-card__label">Today's Score</span>
          <div className="exec-score-card__number" data-grade={grade}>
            {todayScore ?? 0}
          </div>
          <span className="exec-score-card__date">{format(new Date(), 'EEEE, d MMM')}</span>
        </div>
        <div className="exec-score-card__right">
          <ScorePip label="Tasks"   value={stats.tasksDone}   max={stats.tasksDue}        color="var(--execution)" pts={40} />
          <ScorePip label="Habits"  value={stats.habitsDone}  max={stats.habitsScheduled} color="var(--accent-bright)" pts={35} />
          <ScorePip label="Growth"  value={scoreBreakdown?.growth_score ?? 0}    max={15}  color="var(--growth)" pts={15} />
          <ScorePip label="Finance" value={scoreBreakdown?.awareness_score ?? 0} max={10}  color="var(--finance)" pts={10} />
        </div>
      </div>

      {/* Tasks today */}
      <section>
        <div className="section-header">
          <h3 className="exec-section-title">
            <CheckSquare size={15} style={{ color: 'var(--execution)' }} />
            Tasks Today
            <span className="exec-count">{stats.tasksDone}/{stats.tasksDue}</span>
          </h3>
          <Link to="tasks" className="section-header__link">
            All <ArrowRight size={13} />
          </Link>
        </div>

        {loading.tasks ? (
          <TaskSkeleton />
        ) : tasks.length === 0 ? (
          <div className="exec-empty card">
            <Zap size={18} style={{ color: 'var(--text-muted)' }} />
            <span>No tasks due today</span>
            <Link to="tasks" className="btn btn-secondary btn-sm"><Plus size={13} /> Add Task</Link>
          </div>
        ) : (
          <div className="card exec-task-list">
            {tasks
              .sort((a, b) => {
                const pOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                return pOrder[a.priority] - pOrder[b.priority]
              })
              .map((task, i) => (
                <div
                  key={task.id}
                  className={`exec-task-row ${i < tasks.length - 1 ? 'exec-task-row--divider' : ''} ${task.status === 'done' ? 'exec-task-row--done' : ''}`}
                >
                  <button
                    className={`task-check ${task.status === 'done' ? 'task-check--done' : ''}`}
                    onClick={() => handleToggleTask(task)}
                    aria-label={task.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.status === 'done' && <span className="task-check__tick">✓</span>}
                  </button>
                  <div className="exec-task-row__info">
                    <span className="exec-task-row__title">{task.title}</span>
                    {task.description && (
                      <span className="exec-task-row__desc">{task.description}</span>
                    )}
                  </div>
                  <span
                    className="exec-priority-dot"
                    style={{ background: PRIORITY_COLOR[task.priority] }}
                    title={PRIORITY_LABEL[task.priority]}
                  />
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Habits today */}
      <section>
        <div className="section-header">
          <h3 className="exec-section-title">
            <Flame size={15} style={{ color: 'var(--execution)' }} />
            Habits Today
            <span className="exec-count">{stats.habitsDone}/{stats.habitsScheduled}</span>
          </h3>
          <Link to="habits" className="section-header__link">
            All <ArrowRight size={13} />
          </Link>
        </div>

        {loading.habits ? (
          <HabitSkeleton />
        ) : activeHabits.length === 0 ? (
          <div className="exec-empty card">
            <Flame size={18} style={{ color: 'var(--text-muted)' }} />
            <span>No habits yet</span>
            <Link to="habits" className="btn btn-secondary btn-sm"><Plus size={13} /> Add Habit</Link>
          </div>
        ) : (
          <div className="exec-habit-grid">
            {activeHabits.map(habit => {
              const done = isCompletedToday(habit.id)
              return (
                <button
                  key={habit.id}
                  className={`habit-tile ${done ? 'habit-tile--done' : ''}`}
                  style={{ '--habit-color': habit.color }}
                  onClick={() => handleHabitToggle(habit)}
                >
                  <span className="habit-tile__icon">{habit.icon}</span>
                  <span className="habit-tile__name">{habit.name}</span>
                  <div className="habit-tile__streak">
                    <Flame size={10} />
                    {habit.current_streak}
                  </div>
                  {done && <span className="habit-tile__check">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ScorePip({ label, value, max, color, pts }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : (value > 0 ? 100 : 0)
  return (
    <div className="exec-score-pip">
      <div className="exec-score-pip__track">
        <div className="exec-score-pip__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="exec-score-pip__meta">
        <span>{label}</span>
        <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          {typeof value === 'number' && max > 0 ? `${value}/${max}` : `${value}/${pts}`}
        </span>
      </div>
    </div>
  )
}

function TaskSkeleton() {
  return (
    <div className="card" style={{ padding: '8px 0' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
          <div className="skeleton" style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="skeleton" style={{ width: '60%', height: '13px' }} />
            <div className="skeleton" style={{ width: '35%', height: '10px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function HabitSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--r-lg)' }} />
      ))}
    </div>
  )
}
