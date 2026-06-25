-- GolfCharity Supabase Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_renewal_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  charity_id UUID,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charities table
CREATE TABLE IF NOT EXISTS charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website TEXT,
  upcoming_events JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK after charities is created
ALTER TABLE users ADD CONSTRAINT fk_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

-- Draws table
CREATE TABLE IF NOT EXISTS draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_month TEXT NOT NULL UNIQUE, -- format: YYYY-MM
  draw_numbers INTEGER[] NOT NULL,
  algorithm TEXT DEFAULT 'random' CHECK (algorithm IN ('random', 'algorithmic')),
  total_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_pool DECIMAL(10,2) DEFAULT 0,
  four_match_pool DECIMAL(10,2) DEFAULT 0,
  three_match_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_rollover DECIMAL(10,2) DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Winners table
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5_match', '4_match', '3_match')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'proof_submitted', 'approved', 'rejected', 'paid')),
  proof_url TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prize pool contributions
CREATE TABLE IF NOT EXISTS prize_pool_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(score_date);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_status ON winners(status);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed default charities
INSERT INTO charities (name, description, image_url, website, featured, upcoming_events) VALUES
('Golf for Good Foundation', 'Supporting underprivileged youth access to golf and sports education worldwide.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600', 'https://example.com', TRUE, '[{"title": "Charity Golf Day", "date": "2026-07-15", "location": "St Andrews, Scotland"}]'),
('Green Hearts', 'Environmental charity planting trees through every golf round played.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600', 'https://example.com', TRUE, '[{"title": "Tree Planting Drive", "date": "2026-08-01", "location": "Yorkshire"}]'),
('Swing for Health', 'Providing mental health support through golf therapy programs.', 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=600', 'https://example.com', FALSE, '[]'),
('Junior Links', 'Getting kids onto the golf course through coaching and equipment donations.', 'https://images.unsplash.com/photo-1509725070763-30dbbf2d1fd0?w=600', 'https://example.com', FALSE, '[{"title": "Junior Open Day", "date": "2026-09-10", "location": "Wentworth Club"}]')
ON CONFLICT DO NOTHING;

-- Seed admin user (password: Admin@123)
-- bcrypt hash for Admin@123
INSERT INTO users (name, email, password, role, subscription_status) VALUES
('Admin', 'admin@golfcharity.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniB4eSNuiyaQaGbMiCFsHLBdy', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
