-- Referral System Tables
-- Tracks referrals, bonuses, and payouts

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  email_invited TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'subscribed')),
  views_awarded INTEGER DEFAULT 0,
  cash_awarded DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- Referral payouts table
CREATE TABLE IF NOT EXISTS referral_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  paypal_email TEXT,
  paypal_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON referral_payouts(user_id);

-- User payout settings (PayPal email)
CREATE TABLE IF NOT EXISTS user_payout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add referral_code to users table for quick access
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for new users
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON users;
CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

-- Function to process referral when user signs up
CREATE OR REPLACE FUNCTION process_referral_signup(
  p_new_user_id UUID,
  p_referral_code TEXT
)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
  v_views_bonus INTEGER;
BEGIN
  -- Get referrer ID from code
  SELECT user_id INTO v_referrer_id FROM users WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get views bonus from admin settings
  SELECT referral_views_bonus INTO v_views_bonus FROM admin_settings LIMIT 1;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, referral_code, status, views_awarded, signed_up_at)
  VALUES (v_referrer_id, p_new_user_id, p_referral_code, 'signed_up', COALESCE(v_views_bonus, 10), NOW());
  
  -- Award views to referrer
  UPDATE users SET available_views = available_views + COALESCE(v_views_bonus, 10)
  WHERE id = v_referrer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral when user subscribes
CREATE OR REPLACE FUNCTION process_referral_subscription(
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
  v_cash_bonus DECIMAL(10,2);
BEGIN
  -- Get referral for this user
  SELECT * INTO v_referral FROM referrals WHERE referred_id = p_user_id AND status = 'signed_up';
  
  IF v_referral.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get cash bonus from admin settings
  SELECT referral_cash_bonus INTO v_cash_bonus FROM admin_settings LIMIT 1;
  
  -- Update referral status
  UPDATE referrals 
  SET status = 'subscribed', 
      cash_awarded = COALESCE(v_cash_bonus, 10),
      subscribed_at = NOW()
  WHERE id = v_referral.id;
  
  -- Add to referrer's earnings (tracked in referrals table, can be aggregated for payouts)
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Referrals: Users can view their own referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Only service role can insert/update
CREATE POLICY "Service role full access" ON referrals
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Payouts: Users can view their own payouts
ALTER TABLE referral_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON referral_payouts
  FOR SELECT USING (user_id = auth.uid());

-- Payout settings: Users can manage their own
ALTER TABLE user_payout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payout settings" ON user_payout_settings
  FOR ALL USING (user_id = auth.uid());

-- Add referral config columns to admin_settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS referral_views_bonus INTEGER DEFAULT 10;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS referral_cash_bonus DECIMAL(10,2) DEFAULT 10.00;

-- Leaderboard function
CREATE OR REPLACE FUNCTION get_referral_leaderboard()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  total_referrals BIGINT,
  total_views_earned BIGINT,
  total_cash_earned DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.referrer_id as user_id,
    u.name,
    COUNT(r.id) as total_referrals,
    COALESCE(SUM(r.views_awarded), 0) as total_views_earned,
    COALESCE(SUM(r.cash_awarded), 0) as total_cash_earned
  FROM referrals r
  JOIN users u ON u.id = r.referrer_id
  GROUP BY r.referrer_id, u.name
  ORDER BY total_referrals DESC, total_cash_earned DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
