/**
 * OPERATOROS REALTIME ENGINE
 *
 * Single source of truth for all Supabase realtime subscriptions.
 * Manages 8 channels, triggers cross-module score recalculation,
 * and exposes connection status.
 *
 * Architecture:
 *   One channel per table, all routed through a single manager class.
 *   Score is recalculated via RPC whenever any action-affecting table changes.
 */

import { supabase } from './supabase'

class RealtimeEngine {
  constructor() {
    this.channels   = {}   // { channelName: RealtimeChannel }
    this.userId     = null
    this.callbacks  = {}   // { event: [fn, ...] }
    this.connected  = false
  }

  // ── Lifecycle ──────────────────────────────────────────────

  start(userId, stores) {
    if (this.userId === userId) return // already running for this user
    this.stop()
    this.userId = userId
    this.stores = stores

    this._subscribeTransactions()
    this._subscribeSavingsGoals()
    this._subscribeTasks()
    this._subscribeHabits()
    this._subscribeHabitCompletions()
    this._subscribeDailyScores()
    this._subscribeOutreach()

    this.connected = true
    this._emit('status', { connected: true })
    console.log('[RealtimeEngine] Started for user:', userId)
  }

  stop() {
    Object.values(this.channels).forEach(ch => {
      try { ch.unsubscribe() } catch {}
    })
    this.channels   = {}
    this.userId     = null
    this.connected  = false
    this._emit('status', { connected: false })
    console.log('[RealtimeEngine] Stopped')
  }

  // ── Event system (for React hooks) ────────────────────────

  on(event, fn) {
    if (!this.callbacks[event]) this.callbacks[event] = []
    this.callbacks[event].push(fn)
    return () => this.off(event, fn)
  }

  off(event, fn) {
    if (!this.callbacks[event]) return
    this.callbacks[event] = this.callbacks[event].filter(f => f !== fn)
  }

  _emit(event, data) {
    ;(this.callbacks[event] || []).forEach(fn => fn(data))
  }

  // ── Score recalculation ────────────────────────────────────
  // Called after any event that affects the daily score

  async _recalcScore() {
    if (!this.userId) return
    try {
      const { data, error } = await supabase.rpc('calculate_daily_score', {
        p_user_id: this.userId,
        p_date:    new Date().toISOString().split('T')[0],
      })
      if (error) throw error
      if (data?.[0] && this.stores?.osStore) {
        this.stores.osStore.setState({
          todayScore:     data[0].score,
          scoreBreakdown: data[0],
        })
      }
      this._emit('score_updated', data?.[0])
    } catch (e) {
      console.error('[RealtimeEngine] Score recalc error:', e.message)
    }
  }

  // ── Channel builders ───────────────────────────────────────

  _channel(name) {
    if (this.channels[name]) {
      try { this.channels[name].unsubscribe() } catch {}
    }
    return supabase.channel(name)
  }

  _subscribeTransactions() {
    const name = `rt_transactions_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'transactions',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      this.stores?.financeStore?.setState(s => ({
        transactions: [payload.new, ...s.transactions],
      }))
      this._emit('transaction:insert', payload.new)
      this._recalcScore()
    })
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'transactions',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      this.stores?.financeStore?.setState(s => ({
        transactions: s.transactions.map(t => t.id === payload.new.id ? payload.new : t),
      }))
      this._emit('transaction:update', payload.new)
    })
    .on('postgres_changes', {
      event: 'DELETE', schema: 'public', table: 'transactions',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      this.stores?.financeStore?.setState(s => ({
        transactions: s.transactions.filter(t => t.id !== payload.old.id),
      }))
      this._emit('transaction:delete', payload.old)
    })
    .subscribe(status => {
      if (status === 'SUBSCRIBED') console.log('[RealtimeEngine] transactions channel ready')
    })

    this.channels[name] = ch
  }

  _subscribeSavingsGoals() {
    const name = `rt_savings_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'savings_goals',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      const { financeStore } = this.stores || {}
      if (!financeStore) return

      if (payload.eventType === 'INSERT') {
        financeStore.setState(s => ({ savingsGoals: [payload.new, ...s.savingsGoals] }))
      } else if (payload.eventType === 'UPDATE') {
        financeStore.setState(s => ({
          savingsGoals: s.savingsGoals.map(g => g.id === payload.new.id ? payload.new : g),
        }))
      } else if (payload.eventType === 'DELETE') {
        financeStore.setState(s => ({
          savingsGoals: s.savingsGoals.filter(g => g.id !== payload.old.id),
        }))
      }
      this._emit('savings_goal:change', payload)
    })
    .subscribe()

    this.channels[name] = ch
  }

  _subscribeTasks() {
    const name = `rt_tasks_${this.userId}`
    const ch   = this._channel(name)
    const today = new Date().toISOString().split('T')[0]

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'tasks',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      const { executionStore } = this.stores || {}

      if (payload.eventType === 'INSERT') {
        executionStore?.getState?.().upsertTaskLocal(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        executionStore?.getState?.().upsertTaskLocal(payload.new)
        // Recalc score when task status changes to 'done' or away from 'done'
        if (payload.new.status !== payload.old.status) this._recalcScore()
      } else if (payload.eventType === 'DELETE') {
        executionStore?.getState?.().removeTaskLocal(payload.old.id)
      }
      this._emit('task:change', payload)
    })
    .subscribe()

    this.channels[name] = ch
  }

  _subscribeHabits() {
    const name = `rt_habits_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'habits',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      const { executionStore } = this.stores || {}

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        executionStore?.getState?.().upsertHabitLocal(payload.new)
      } else if (payload.eventType === 'DELETE') {
        executionStore?.setState?.(s => ({
          habits: s.habits.filter(h => h.id !== payload.old.id),
        }))
      }
      this._emit('habit:change', payload)
    })
    .subscribe()

    this.channels[name] = ch
  }

  _subscribeHabitCompletions() {
    const name = `rt_habit_completions_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'habit_completions',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      const { executionStore } = this.stores || {}

      if (payload.eventType === 'INSERT') {
        executionStore?.getState?.().upsertCompletionLocal(payload.new)
      } else if (payload.eventType === 'DELETE') {
        executionStore?.getState?.().removeCompletionLocal(payload.old.id)
      }
      // Always recalc — completions directly affect discipline score
      this._recalcScore()
      this._emit('habit_completion:change', payload)
    })
    .subscribe()

    this.channels[name] = ch
  }

  _subscribeDailyScores() {
    const name = `rt_daily_scores_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'daily_scores',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      if (payload.new && this.stores?.osStore) {
        const today = new Date().toISOString().split('T')[0]
        if (payload.new.date === today) {
          this.stores.osStore.setState({
            todayScore:     payload.new.score,
            scoreBreakdown: payload.new,
          })
        }
        // Append to week scores if not already present
        this.stores.osStore.setState(s => {
          const exists = s.weekScores.find(ws => ws.date === payload.new.date)
          return {
            weekScores: exists
              ? s.weekScores.map(ws => ws.date === payload.new.date ? payload.new : ws)
              : [...s.weekScores, { date: payload.new.date, score: payload.new.score }]
                  .sort((a, b) => new Date(a.date) - new Date(b.date)),
          }
        })
      }
      this._emit('score:change', payload.new)
    })
    .subscribe()

    this.channels[name] = ch
  }

  _subscribeOutreach() {
    const name = `rt_outreach_${this.userId}`
    const ch   = this._channel(name)

    ch.on('postgres_changes', {
      event: '*', schema: 'public', table: 'outreach_logs',
      filter: `user_id=eq.${this.userId}`,
    }, payload => {
      const { growthStore } = this.stores || {}

      if (payload.eventType === 'INSERT') {
        growthStore?.getState?.().upsertOutreachLocal(payload.new)
        this._recalcScore()
      } else if (payload.eventType === 'UPDATE') {
        growthStore?.getState?.().upsertOutreachLocal(payload.new)
      } else if (payload.eventType === 'DELETE') {
        growthStore?.getState?.().removeOutreachLocal(payload.old.id)
      }
      this._emit('outreach:change', payload)
    })
    .subscribe()

    this.channels[name] = ch
  }

  // ── Connection health ──────────────────────────────────────

  getChannelCount() { return Object.keys(this.channels).length }
  isConnected()     { return this.connected }
}

// Singleton — one engine for the entire app
export const realtimeEngine = new RealtimeEngine()
