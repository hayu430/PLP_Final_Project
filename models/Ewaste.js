const supabase = require('./db');

class Ewaste {
  static async create(itemData) {
    const { data, error } = await supabase
      .from('ewaste_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('ewaste_items')
      .select('*')
      .eq('user_id', userId)
      .order('date_submitted', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('ewaste_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('ewaste_items')
      .select(`
        *,
        users:user_id (name, email)
      `)
      .order('date_submitted', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('ewaste_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('ewaste_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async getStatsByStatus() {
    const { data, error } = await supabase
      .from('ewaste_items')
      .select('status');

    if (error) throw error;

    const stats = {
      Pending: 0,
      Collected: 0,
      Recycled: 0
    };

    data.forEach(item => {
      if (stats.hasOwnProperty(item.status)) {
        stats[item.status]++;
      }
    });

    return stats;
  }

  static async getStatsByCategory() {
    const { data, error } = await supabase
      .from('ewaste_items')
      .select('category');

    if (error) throw error;

    const categoryCount = {};
    data.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    return categoryCount;
  }

  static async getTotalCount() {
    const { count, error } = await supabase
      .from('ewaste_items')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count;
  }
}

module.exports = Ewaste;
