import { supabase } from './supabase'

export const visionService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('vision_assets')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(asset) {
    const { data, error } = await supabase
      .from('vision_assets')
      .insert([asset])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('vision_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('vision_assets').delete().eq('id', id)
    if (error) throw error
  },
}
