import { create } from 'zustand'
import { taskService, habitService, completionService } from '../services/executionApi'
import { supabase } from '../services/supabase'

export const useExecutionStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────
  tasks:            [],
  habits:           [],
  habitCompletions: [],
  loading: { tasks: false, habits: false, completions: false },

  setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),

  // ── Tasks ─────────────────────────────────────────────────
  fetchAllTasks: async (userId) => {
    get().setLoading('tasks', true)
    try {
      const data = await taskService.getAll(userId)
      set({ tasks: data })
    } finally { get().setLoading('tasks', false) }
  },

  fetchTodayTasks: async (userId) => {
    get().setLoading('tasks', true)
    try {
      const data = await taskService.getToday(userId)
      set({ tasks: data })
    } finally { get().setLoading('tasks', false) }
  },

  addTask: async (task) => {
    const data = await taskService.create(task)
    set(s => ({ tasks: [...s.tasks, data] }))
    return data
  },

  updateTask: async (id, updates) => {
    const data = await taskService.update(id, updates)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? data : t) }))
    return data
  },

  deleteTask: async (id) => {
    await taskService.delete(id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },

  toggleTaskDone: async (task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    const data = await taskService.setStatus(task.id, newStatus)
    set(s => ({ tasks: s.tasks.map(t => t.id === task.id ? data : t) }))
    return data
  },

  // ── Habits ────────────────────────────────────────────────
  fetchHabits: async (userId) => {
    get().setLoading('habits', true)
    try {
      const data = await habitService.getAll(userId)
      set({ habits: data })
    } finally { get().setLoading('habits', false) }
  },

  addHabit: async (habit) => {
    const data = await habitService.create(habit)
    set(s => ({ habits: [...s.habits, data] }))
    return data
  },

  updateHabit: async (id, updates) => {
    const data = await habitService.update(id, updates)
    set(s => ({ habits: s.habits.map(h => h.id === id ? data : h) }))
    return data
  },

  deleteHabit: async (id) => {
    await habitService.delete(id)
    set(s => ({ habits: s.habits.filter(h => h.id !== id) }))
  },

  // ── Habit Completions ─────────────────────────────────────
  fetchTodayCompletions: async (userId) => {
    get().setLoading('completions', true)
    try {
      const data = await completionService.getTodayCompletions(userId)
      set({ habitCompletions: data })
    } finally { get().setLoading('completions', false) }
  },

  completeHabit: async (habitId, userId) => {
    const data = await completionService.complete(habitId, userId)
    set(s => ({ habitCompletions: [...s.habitCompletions, data] }))
    // Refresh habit to get updated streak from DB trigger
    const updated = await habitService.getAll(userId)
    set({ habits: updated })
    return data
  },

  uncompleteHabit: async (habitId, userId) => {
    await completionService.uncomplete(habitId, userId)
    set(s => ({ habitCompletions: s.habitCompletions.filter(c => c.habit_id !== habitId) }))
    const updated = await habitService.getAll(userId)
    set({ habits: updated })
  },

  // ── Helpers ───────────────────────────────────────────────
  isCompletedToday: (habitId) => {
    return get().habitCompletions.some(c => c.habit_id === habitId)
  },

  getTodayStats: () => {
    const { tasks, habitCompletions, habits } = get()
    const activeHabits = habits.filter(h => h.is_active)
    return {
      tasksDue:        tasks.length,
      tasksDone:       tasks.filter(t => t.status === 'done').length,
      habitsScheduled: activeHabits.length,
      habitsDone:      habitCompletions.length,
    }
  },

  // ── Realtime handlers (called by RealtimeEngine) ──────────
  upsertTaskLocal: (task) => {
    set(s => {
      const exists = s.tasks.find(t => t.id === task.id)
      return { tasks: exists ? s.tasks.map(t => t.id === task.id ? task : t) : [...s.tasks, task] }
    })
  },

  removeTaskLocal: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

  upsertHabitLocal: (habit) => {
    set(s => {
      const exists = s.habits.find(h => h.id === habit.id)
      return { habits: exists ? s.habits.map(h => h.id === habit.id ? habit : h) : [...s.habits, habit] }
    })
  },

  upsertCompletionLocal: (c) => {
    set(s => {
      const exists = s.habitCompletions.find(x => x.id === c.id)
      return { habitCompletions: exists ? s.habitCompletions.map(x => x.id === c.id ? c : x) : [...s.habitCompletions, c] }
    })
  },

  removeCompletionLocal: (id) => set(s => ({ habitCompletions: s.habitCompletions.filter(c => c.id !== id) })),
}))
