import { supabase } from './supabase'

export const outreachService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('*')
      .eq('user_id', userId)
      .order('contacted_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(log) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .insert([log])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('outreach_logs').delete().eq('id', id)
    if (error) throw error
  },
}
