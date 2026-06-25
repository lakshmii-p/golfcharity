const supabase = require('../utils/supabase');
const { sendEmail } = require('../utils/email');

const getMyWinnings = async (req, res) => {
  try {
    const { data: winnings, error } = await supabase
      .from('winners')
      .select('*, draws(draw_month, draw_numbers)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const total = winnings?.reduce((sum, w) => sum + (w.status === 'paid' ? w.amount : 0), 0) || 0;
    res.json({ winnings, totalWon: total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch winnings' });
  }
};

const uploadProof = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { proofUrl } = req.body;

    const { data: winner } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .eq('user_id', req.user.id)
      .single();

    if (!winner) return res.status(404).json({ error: 'Winner record not found' });
    if (winner.status !== 'pending') return res.status(400).json({ error: 'Proof already submitted' });

    const { data: updated, error } = await supabase
      .from('winners')
      .update({ proof_url: proofUrl, status: 'proof_submitted' })
      .eq('id', winnerId)
      .select()
      .single();

    if (error) throw error;
    res.json({ winner: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload proof' });
  }
};

// Admin
const getAllWinners = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('winners')
      .select('*, users(name, email), draws(draw_month, draw_numbers)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: winners, error } = await query;
    if (error) throw error;
    res.json({ winners });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
};

const verifyWinner = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: winner, error } = await supabase
      .from('winners')
      .update({ status: newStatus, verified_at: new Date().toISOString() })
      .eq('id', winnerId)
      .select('*, users(name, email)')
      .single();

    if (error) throw error;

    await sendEmail({
      to: winner.users.email,
      subject: `Your winning verification has been ${newStatus}`,
      html: `<h2>Hi ${winner.users.name},</h2><p>Your verification has been <strong>${newStatus}</strong>.</p>${action === 'approve' ? '<p>Your payment will be processed soon.</p>' : '<p>Please contact support if you believe this is an error.</p>'}`,
    });

    res.json({ winner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify winner' });
  }
};

const markPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    const { data: winner, error } = await supabase
      .from('winners')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', winnerId)
      .select('*, users(name, email)')
      .single();

    if (error) throw error;

    await sendEmail({
      to: winner.users.email,
      subject: 'Your prize payment has been sent!',
      html: `<h2>Hi ${winner.users.name}!</h2><p>Your prize of <strong>₹${winner.amount.toFixed(2)}</strong> has been paid. Congratulations!</p>`,
    });

    res.json({ winner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
};

module.exports = { getMyWinnings, uploadProof, getAllWinners, verifyWinner, markPaid };
