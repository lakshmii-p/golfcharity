const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // Check subscription status on every request
    if (user.subscription_status === 'lapsed') {
      req.subscriptionLapsed = true;
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireSubscription = (req, res, next) => {
  if (req.user?.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireSubscription };
