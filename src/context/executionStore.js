import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useExecutionStore = create((set, get) => ({
  tasks:            [],
  habits:           [],
  habitCompletions: [],
  loading: { tasks: false, habits: false },

  // ── Tasks ─────────────────────────────────────────────────
  fetchTodayTasks: async (userId) => {
    set(s => ({ loading: { ...s.loading, tasks: true } }))
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('due_date', today)
        .neq('status', 'cancelled')
        .order('priority', { ascending: false })
      if (error) throw error
      set({ tasks: data || [] })
    } finally {
      set(s => ({ loading: { ...s.loading, tasks: false } }))
    }
  },

  fetchAllTasks: async (userId) => {
    set(s => ({ loading: { ...s.loading, tasks: true } }))
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'cancelled')
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false })
      if (error) throw error
      set({ tasks: data || [] })
    } finally {
      set(s => ({ loading: { ...s.loading, tasks: false } }))
    }
  },

  upsertTaskLocal: (task) => {
    set(s => {
      const exists = s.tasks.find(t => t.id === task.id)
      return {
        tasks: exists
          ? s.tasks.map(t => t.id === task.id ? task : t)
          : [task, ...s.tasks],
      }
    })
  },

  removeTaskLocal: (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },

  // ── Habits ────────────────────────────────────────────────
  fetchHabits: async (userId) => {
    set(s => ({ loading: { ...s.loading, habits: true } }))
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      set({ habits: data || [] })
    } finally {
      set(s => ({ loading: { ...s.loading, habits: false } }))
    }
  },

  fetchTodayCompletions: async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
    if (error) throw error
    set({ habitCompletions: data || [] })
  },

  upsertHabitLocal: (habit) => {
    set(s => {
      const exists = s.habits.find(h => h.id === habit.id)
      return {
        habits: exists
          ? s.habits.map(h => h.id === habit.id ? habit : h)
          : [...s.habits, habit],
      }
    })
  },

  upsertCompletionLocal: (completion) => {
    set(s => {
      const exists = s.habitCompletions.find(c => c.id === completion.id)
      return {
        habitCompletions: exists
          ? s.habitCompletions.map(c => c.id === completion.id ? completion : c)
          : [...s.habitCompletions, completion],
      }
    })
  },

  removeCompletionLocal: (id) => {
    set(s => ({ habitCompletions: s.habitCompletions.filter(c => c.id !== id) }))
  },

  // ── Helpers ───────────────────────────────────────────────
  isHabitCompletedToday: (habitId) => {
    return get().habitCompletions.some(c => c.habit_id === habitId)
  },

  getTodayStats: () => {
    const { tasks, habitCompletions, habits } = get()
    return {
      tasksDue:         tasks.length,
      tasksDone:        tasks.filter(t => t.status === 'done').length,
      habitsScheduled:  habits.length,
      habitsDone:       habitCompletions.length,
    }
  },
}))
