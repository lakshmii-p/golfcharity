const supabase = require('../utils/supabase');

const getStats = async (req, res) => {
  try {
    const [usersRes, drawsRes, charityRes, winnersRes, poolRes] = await Promise.all([
      supabase.from('users').select('id, subscription_status, created_at'),
      supabase.from('draws').select('id, total_pool, draw_month').order('draw_month', { ascending: false }),
      supabase.from('users').select('charity_percentage, subscription_plan'),
      supabase.from('winners').select('amount, status'),
      supabase.from('prize_pool_contributions').select('amount'),
    ]);

    const users = usersRes.data || [];
    const draws = drawsRes.data || [];
    const winners = winnersRes.data || [];
    const pool = poolRes.data || [];

    const totalUsers = users.length;
    const activeSubscribers = users.filter(u => u.subscription_status === 'active').length;
    const totalPrizePool = pool.reduce((sum, p) => sum + p.amount, 0);
    const totalPaidOut = winners.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0);
    const totalCharityContributions = users.filter(u => u.subscription_status === 'active').length * 5; // estimate ₹5/sub

    res.json({
      totalUsers,
      activeSubscribers,
      totalPrizePool: totalPrizePool.toFixed(2),
      totalPaidOut: totalPaidOut.toFixed(2),
      totalCharityContributions: totalCharityContributions.toFixed(2),
      totalDraws: draws.length,
      recentDraws: draws.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, role, subscription_status, subscription_plan, subscription_renewal_date, charity_id, charity_percentage, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('subscription_status', status);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data: users, count, error } = await query;
    if (error) throw error;
    res.json({ users, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, subscription_status, subscription_plan, subscription_renewal_date, charity_id, charity_percentage, created_at, scores(*), winners(*, draws(draw_month))')
      .eq('id', id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, subscription_status } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (subscription_status) updates.subscription_status = subscription_status;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, subscription_status')
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const adminEditScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { score, scoreDate } = req.body;
    const updates = {};
    if (score !== undefined) updates.score = score;
    if (scoreDate) updates.score_date = scoreDate;

    const { data: updated, error } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', scoreId)
      .select()
      .single();

    if (error) throw error;
    res.json({ score: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
};

module.exports = { getStats, getUsers, getUserDetail, updateUser, adminEditScore };
