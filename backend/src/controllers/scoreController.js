const supabase = require('../utils/supabase');

const getScores = async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};

const addScore = async (req, res) => {
  try {
    const { score, scoreDate } = req.body;

    if (score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford)' });
    }

    // Check duplicate date
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('score_date', scoreDate)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'A score already exists for this date. Edit or delete it instead.' });
    }

    // Count current scores
    const { data: currentScores } = await supabase
      .from('scores')
      .select('id, score_date')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: true });

    // If already 5 scores, delete oldest
    if (currentScores && currentScores.length >= 5) {
      await supabase.from('scores').delete().eq('id', currentScores[0].id);
    }

    const { data: newScore, error } = await supabase
      .from('scores')
      .insert({ user_id: req.user.id, score, score_date: scoreDate })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ score: newScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add score' });
  }
};

const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, scoreDate } = req.body;

    if (score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45' });
    }

    // Check if this score belongs to user
    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Score not found' });

    // Check duplicate date (excluding current)
    if (scoreDate && scoreDate !== existing.score_date) {
      const { data: dup } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('score_date', scoreDate)
        .neq('id', id)
        .single();

      if (dup) return res.status(400).json({ error: 'A score already exists for this date' });
    }

    const updates = {};
    if (score !== undefined) updates.score = score;
    if (scoreDate) updates.score_date = scoreDate;

    const { data: updated, error } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ score: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update score' });
  }
};

const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Score not found' });

    await supabase.from('scores').delete().eq('id', id);
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
};

module.exports = { getScores, addScore, updateScore, deleteScore };
