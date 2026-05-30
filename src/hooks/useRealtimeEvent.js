import { useEffect } from 'react'
import { realtimeEngine } from '../services/realtimeEngine'

/**
 * Subscribe to a specific realtime engine event from any component.
 *
 * Usage:
 *   useRealtimeEvent('score:change', (data) => { ... })
 *   useRealtimeEvent('transaction:insert', (tx) => { ... })
 *
 * Available events:
 *   status                 — { connected: boolean }
 *   score_updated          — score breakdown object
 *   score:change           — score row from DB
 *   transaction:insert     — new transaction
 *   transaction:update     — updated transaction
 *   transaction:delete     — deleted transaction
 *   task:change            — postgres_changes payload
 *   habit:change           — postgres_changes payload
 *   habit_completion:change — postgres_changes payload
 *   savings_goal:change    — postgres_changes payload
 *   outreach:change        — postgres_changes payload
 */
export function useRealtimeEvent(event, callback) {
  useEffect(() => {
    if (!event || !callback) return
    const unsub = realtimeEngine.on(event, callback)
    return unsub
  }, [event])
}
