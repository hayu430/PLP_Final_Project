const supabase = require('./db');
const bcrypt = require('bcrypt');

class User {
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        { name, email, password: hashedPassword, role: 'user', points: 0 }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePoints(userId, pointsToAdd) {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    const newPoints = user.points + pointsToAdd;

    const { data, error } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, points, created_at')
      .order('points', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('users')
      .select('name, points')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

module.exports = User;
