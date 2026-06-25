const supabase = require('../utils/supabase');
const { sendEmail, emailTemplates } = require('../utils/email');

// Generate 5 random numbers 1-45
const randomDraw = () => {
  const numbers = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
};

// Algorithmic draw: weighted by score frequency
const algorithmicDraw = async () => {
  const { data: scores } = await supabase.from('scores').select('score');
  if (!scores || scores.length === 0) return randomDraw();

  const freq = {};
  scores.forEach(({ score }) => { freq[score] = (freq[score] || 0) + 1; });

  // Build weighted pool (more frequent = more weight)
  const pool = [];
  Object.entries(freq).forEach(([score, count]) => {
    for (let i = 0; i < count; i++) pool.push(parseInt(score));
  });

  const picked = [];
  const poolCopy = [...pool];
  while (picked.length < 5 && poolCopy.length > 0) {
    const idx = Math.floor(Math.random() * poolCopy.length);
    const val = poolCopy[idx];
    if (!picked.includes(val)) picked.push(val);
    poolCopy.splice(idx, 1);
  }

  // Fill remaining with random if needed
  while (picked.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!picked.includes(n)) picked.push(n);
  }

  return picked.sort((a, b) => a - b);
};

const simulateDraw = async (req, res) => {
  try {
    const { algorithm = 'random' } = req.body;
    const numbers = algorithm === 'algorithmic' ? await algorithmicDraw() : randomDraw();

    // Get all active subscribers with their scores for preview
    const { data: subscribers } = await supabase
      .from('users')
      .select('id, name, email, scores(score)')
      .eq('subscription_status', 'active');

    const results = { five: [], four: [], three: [], noMatch: [] };
    subscribers?.forEach((user) => {
      const userScores = user.scores?.map(s => s.score) || [];
      const matches = numbers.filter(n => userScores.includes(n)).length;
      if (matches >= 5) results.five.push({ id: user.id, name: user.name });
      else if (matches === 4) results.four.push({ id: user.id, name: user.name });
      else if (matches === 3) results.three.push({ id: user.id, name: user.name });
      else results.noMatch.push({ id: user.id, name: user.name });
    });

    res.json({ numbers, results, simulation: true });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed' });
  }
};

const runDraw = async (req, res) => {
  try {
    const { algorithm = 'random', month } = req.body;
    const drawMonth = month || new Date().toISOString().slice(0, 7);

    // Check if draw already ran for this month
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('draw_month', drawMonth)
      .single();

    if (existing) return res.status(400).json({ error: 'Draw already ran for this month' });

    const numbers = algorithm === 'algorithmic' ? await algorithmicDraw() : randomDraw();

    // Calculate prize pool for this month
    const { data: contributions } = await supabase
      .from('prize_pool_contributions')
      .select('amount')
      .gte('period_start', `${drawMonth}-01`)
      .lt('period_start', `${drawMonth}-31`);

    const totalPool = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // Get previous jackpot rollover
    const { data: prevDraw } = await supabase
      .from('draws')
      .select('jackpot_rollover')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const rollover = prevDraw?.jackpot_rollover || 0;
    const jackpotPool = totalPool * 0.4 + rollover;
    const fourPool = totalPool * 0.35;
    const threePool = totalPool * 0.25;

    // Match subscribers
    const { data: subscribers } = await supabase
      .from('users')
      .select('id, name, email, scores(score)')
      .eq('subscription_status', 'active');

    const winners = { five: [], four: [], three: [] };
    subscribers?.forEach((user) => {
      const userScores = user.scores?.map(s => s.score) || [];
      const matches = numbers.filter(n => userScores.includes(n)).length;
      if (matches >= 5) winners.five.push(user);
      else if (matches === 4) winners.four.push(user);
      else if (matches === 3) winners.three.push(user);
    });

    // Calculate payouts
    const fivePayout = winners.five.length > 0 ? jackpotPool / winners.five.length : 0;
    const fourPayout = winners.four.length > 0 ? fourPool / winners.four.length : 0;
    const threePayout = winners.three.length > 0 ? threePool / winners.three.length : 0;
    const newRollover = winners.five.length === 0 ? jackpotPool : 0;

    // Create draw record
    const { data: draw, error } = await supabase
      .from('draws')
      .insert({
        draw_month: drawMonth,
        draw_numbers: numbers,
        algorithm,
        total_pool: totalPool,
        jackpot_pool: jackpotPool,
        four_match_pool: fourPool,
        three_match_pool: threePool,
        jackpot_rollover: newRollover,
        published: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert winners
    const winnerInserts = [];
    [...winners.five.map(u => ({ user_id: u.id, draw_id: draw.id, match_type: '5_match', amount: fivePayout, status: 'pending' })),
     ...winners.four.map(u => ({ user_id: u.id, draw_id: draw.id, match_type: '4_match', amount: fourPayout, status: 'pending' })),
     ...winners.three.map(u => ({ user_id: u.id, draw_id: draw.id, match_type: '3_match', amount: threePayout, status: 'pending' }))
    ].forEach(w => winnerInserts.push(w));

    if (winnerInserts.length > 0) {
      await supabase.from('winners').insert(winnerInserts);
    }

    res.json({
      draw,
      numbers,
      winners: {
        five: { users: winners.five.map(u => u.name), payout: fivePayout },
        four: { users: winners.four.map(u => u.name), payout: fourPayout },
        three: { users: winners.three.map(u => u.name), payout: threePayout },
      },
      jackpotRollover: newRollover,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Draw failed' });
  }
};

const publishDraw = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: draw, error } = await supabase
      .from('draws')
      .update({ published: true })
      .eq('id', drawId)
      .select()
      .single();

    if (error) throw error;

    // Get all active subscribers and notify
    const { data: subscribers } = await supabase
      .from('users')
      .select('name, email')
      .eq('subscription_status', 'active');

    subscribers?.forEach(async (user) => {
      await sendEmail({
        to: user.email,
        subject: 'Monthly Draw Results Published!',
        html: `<h2>Hi ${user.name}!</h2><p>This month's draw numbers are: <strong>${draw.draw_numbers.join(', ')}</strong>. Log in to see if you won!</p>`,
      });
    });

    // Notify winners specifically
    const { data: winners } = await supabase
      .from('winners')
      .select('*, users(name, email)')
      .eq('draw_id', drawId);

    winners?.forEach(async (winner) => {
      const tmpl = emailTemplates.winner(winner.users.name, winner.amount.toFixed(2), winner.match_type.replace('_', ' '));
      await sendEmail({ to: winner.users.email, ...tmpl });
    });

    res.json({ draw, message: 'Draw published and notifications sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish draw' });
  }
};

const getDraws = async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });

    if (error) throw error;
    res.json({ draws });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draws' });
  }
};

const getLatestPublishedDraw = async (req, res) => {
  try {
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('published', true)
      .order('draw_month', { ascending: false })
      .limit(1)
      .single();

    res.json({ draw });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch draw' });
  }
};

module.exports = { simulateDraw, runDraw, publishDraw, getDraws, getLatestPublishedDraw };
