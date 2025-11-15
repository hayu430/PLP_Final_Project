const supabase = require('./db');

class Center {
  static async getAll() {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async create(centerData) {
    const { data, error } = await supabase
      .from('centers')
      .insert([centerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('centers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('centers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = Center;
