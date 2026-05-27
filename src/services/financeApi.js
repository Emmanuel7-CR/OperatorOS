import { supabase } from './supabase'

// ── Helpers ──────────────────────────────────────────────────
function monthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end   = new Date(year, month, 0).toISOString().split('T')[0]
  return { start, end }
}

// ── Transactions ─────────────────────────────────────────────
export const transactionService = {
  async getAll(userId, filters = {}) {
    let q = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (filters.type)     q = q.eq('type', filters.type)
    if (filters.category) q = q.eq('category', filters.category)
    if (filters.dateFrom) q = q.gte('date', filters.dateFrom)
    if (filters.dateTo)   q = q.lte('date', filters.dateTo)
    if (filters.search)   q = q.ilike('title', `%${filters.search}%`)

    const { data, error } = await q
    if (error) throw error
    return data
  },

  async getMonthly(userId, year, month) {
    const { start, end } = monthRange(year, month)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async create(tx) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([tx])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Categories ───────────────────────────────────────────────
export const categoryService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order('is_default', { ascending: false })
      .order('name')
    if (error) throw error
    return data
  },

  async create(cat) {
    const { data, error } = await supabase
      .from('categories')
      .insert([cat])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Budgets ──────────────────────────────────────────────────
export const budgetService = {
  async getAll(userId, month, year) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
    if (error) throw error
    return data
  },

  async upsert(budget) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert([budget], { onConflict: 'user_id,category,month,year' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Savings Goals ────────────────────────────────────────────
export const savingsService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*, savings_contributions(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(goal) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([goal])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) throw error
  },

  async addContribution(contribution) {
    const { data, error } = await supabase
      .from('savings_contributions')
      .insert([contribution])
      .select()
      .single()
    if (error) throw error
    return data
  },
}
