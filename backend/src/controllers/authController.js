const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const { sendEmail, emailTemplates } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { name, email, password, charityId, charityPercentage = 10 } = req.body;

    // Check existing
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'subscriber',
        //subscription_status: 'inactive',
        subscription_status: 'active',
        subscription_plan: 'monthly',
        subscription_renewal_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        charity_id: charityId || null,
        charity_percentage: Math.max(10, Math.min(100, charityPercentage)),
      })
      .select()
      .single();

    if (error) throw error;

    const tmpl = emailTemplates.welcome(name);
    await sendEmail({ to: email, ...tmpl });

    const token = generateToken(user.id);
    const { password: _, ...userSafe } = user;

    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    const { password: _, ...userSafe } = user;

    res.json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const getMe = async (req, res) => {
  const { password: _, ...userSafe } = req.user;
  res.json({ user: userSafe });
};

const updateProfile = async (req, res) => {
  try {
    const { name, charityId, charityPercentage } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (charityId !== undefined) updates.charity_id = charityId;
    if (charityPercentage !== undefined) {
      updates.charity_percentage = Math.max(10, Math.min(100, charityPercentage));
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
};

module.exports = { register, login, getMe, updateProfile };
