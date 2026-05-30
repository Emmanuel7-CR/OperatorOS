import { create } from 'zustand'
<<<<<<< HEAD
import { outreachService } from '../services/growthApi'

export const useGrowthStore = create((set, get) => ({
  outreachLogs: [],
  loading:      false,

  fetchAllOutreach: async (userId) => {
    set({ loading: true })
    try {
      const data = await outreachService.getAll(userId)
      set({ outreachLogs: data })
    } finally { set({ loading: false }) }
  },
=======
import { supabase } from '../services/supabase'

export const useGrowthStore = create((set, get) => ({
  outreachLogs: [],
  loading: false,
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9

  fetchTodayOutreach: async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    set({ loading: true })
    try {
<<<<<<< HEAD
      const data = await outreachService.getAll(userId)
      set({ outreachLogs: data })
    } finally { set({ loading: false }) }
=======
      const { data, error } = await supabase
        .from('outreach_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('contacted_at', `${today}T00:00:00`)
        .order('contacted_at', { ascending: false })
      if (error) throw error
      set({ outreachLogs: data || [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchAllOutreach: async (userId) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('outreach_logs')
        .select('*')
        .eq('user_id', userId)
        .order('contacted_at', { ascending: false })
      if (error) throw error
      set({ outreachLogs: data || [] })
    } finally {
      set({ loading: false })
    }
>>>>>>> 37412e791e3d8fdcf1ec9a47652343000fde0ba9
  },

  upsertOutreachLocal: (log) => {
    set(s => {
      const exists = s.outreachLogs.find(l => l.id === log.id)
      return {
        outreachLogs: exists
          ? s.outreachLogs.map(l => l.id === log.id ? log : l)
          : [log, ...s.outreachLogs],
      }
    })
  },

  removeOutreachLocal: (id) => {
    set(s => ({ outreachLogs: s.outreachLogs.filter(l => l.id !== id) }))
  },

  getTodayCount: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().outreachLogs.filter(l =>
      l.contacted_at && l.contacted_at.startsWith(today)
    ).length
  },
}))
