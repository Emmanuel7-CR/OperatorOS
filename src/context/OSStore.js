import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useOSStore = create((set, get) => ({
  // ── Daily Score ──────────────────────────────────────────
  todayScore:      null,
  scoreLoading:    false,
  scoreBreakdown:  null,
  weekScores:      [],

  fetchTodayScore: async (userId) => {
    set({ scoreLoading: true })
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()
      if (error) throw error
      set({ todayScore: data?.score ?? 0, scoreBreakdown: data })
    } catch (e) {
      console.error('Score fetch:', e)
      set({ todayScore: 0 })
    } finally {
      set({ scoreLoading: false })
    }
  },

  calculateScore: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('calculate_daily_score', {
        p_user_id: userId,
        p_date:    new Date().toISOString().split('T')[0],
      })
      if (error) throw error
      if (data?.[0]) {
        set({ todayScore: data[0].score, scoreBreakdown: data[0] })
      }
    } catch (e) {
      console.error('Score calc:', e)
    }
  },

  fetchWeekScores: async (userId) => {
    try {
      const since = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_scores')
        .select('date, score')
        .eq('user_id', userId)
        .gte('date', since)
        .order('date', { ascending: true })
      set({ weekScores: data || [] })
    } catch (e) {
      console.error('Week scores:', e)
    }
  },
}))
