import { supabase } from './supabase'

// ── Tasks ─────────────────────────────────────────────────────
export const taskService = {
  async getAll(userId, filters = {}) {
    let q = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })

    if (filters.status)   q = q.eq('status', filters.status)
    if (filters.priority) q = q.eq('priority', filters.priority)
    if (filters.dueDate)  q = q.eq('due_date', filters.dueDate)

    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getToday(userId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('due_date', today)
      .neq('status', 'cancelled')
      .order('priority', { ascending: false })
    if (error) throw error
    return data
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  async setStatus(id, status) {
    return taskService.update(id, { status })
  },
}

// ── Habits ────────────────────────────────────────────────────
export const habitService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async create(habit) {
    const { data, error } = await supabase
      .from('habits')
      .insert([habit])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Habit Completions ─────────────────────────────────────────
export const completionService = {
  async getTodayCompletions(userId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
    if (error) throw error
    return data
  },

  async getForDateRange(userId, from, to) {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
    if (error) throw error
    return data
  },

  async complete(habitId, userId) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('habit_completions')
      .insert([{ habit_id: habitId, user_id: userId, date: today }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async uncomplete(habitId, userId) {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', today)
    if (error) throw error
  },
}
