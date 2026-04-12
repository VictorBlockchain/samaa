-- Promo Codes System
-- Allows admin to create promo codes for free subscriptions, views, and leads
-- Date: 2026-04-15

-- ============================================================================
-- 1. CREATE PROMO CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  promo_type TEXT NOT NULL CHECK (promo_type IN ('subscription_monthly_free', 'subscription_yearly_free', 'views', 'leads')),
  
  -- For subscription promos
  subscription_months INTEGER DEFAULT 0, -- 1 for 1 month free, 2 for 2 months free
  
  -- For views/leads promos
  amount INTEGER DEFAULT 0, -- Number of views or leads
  
  -- Usage tracking
  max_uses INTEGER NOT NULL DEFAULT 1, -- Maximum times code can be used
  used_count INTEGER NOT NULL DEFAULT 0, -- How many times it's been used
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration date
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_type ON promo_codes(promo_type);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- ============================================================================
-- 2. CREATE PROMO CODE REDEMPTIONS TABLE (track who used what)
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- What was redeemed
  redemption_type TEXT NOT NULL CHECK (redemption_type IN ('subscription_monthly_free', 'subscription_yearly_free', 'views', 'leads')),
  amount INTEGER DEFAULT 0, -- For views/leads
  subscription_months INTEGER DEFAULT 0, -- For subscriptions
  
  -- Subscription details (if applicable)
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  
  -- Prevent duplicate redemptions
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can only redeem same promo once
  UNIQUE(promo_code_id, user_id)
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON promo_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_promo ON promo_redemptions(promo_code_id);

-- ============================================================================
-- 3. ADD PROMO CODE COLUMN TO SUBSCRIPTIONS TABLE
-- ============================================================================

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id),
ADD COLUMN IF NOT EXISTS is_promo_subscription BOOLEAN DEFAULT false;

-- ============================================================================
-- 4. CREATE FUNCTION TO GENERATE RANDOM PROMO CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_promo_code(prefix TEXT DEFAULT 'PROMO')
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := prefix || '-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE FUNCTION TO REDEEM PROMO CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_promo RECORD;
  v_redemption_id UUID;
  v_subscription_start TIMESTAMPTZ;
  v_subscription_end TIMESTAMPTZ;
  v_views_included INTEGER;
  v_leads_included INTEGER;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo 
  FROM promo_codes 
  WHERE code = UPPER(p_code) 
    AND is_active = true 
    AND used_count < max_uses
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Check if promo exists and is valid
  IF v_promo.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired promo code');
  END IF;
  
  -- Check if user already redeemed this promo
  IF EXISTS (SELECT 1 FROM promo_redemptions WHERE promo_code_id = v_promo.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already used this promo code');
  END IF;
  
  -- Get admin settings for subscription defaults
  SELECT premium_monthly_views, premium_monthly_leads 
  INTO v_views_included, v_leads_included
  FROM admin_settings LIMIT 1;
  
  -- Process based on type
  IF v_promo.promo_type = 'subscription_monthly_free' THEN
    v_subscription_start := NOW();
    v_subscription_end := NOW() + INTERVAL '1 month';
    
    -- Create subscription
    INSERT INTO subscriptions (
      user_id, 
      plan_id, 
      status, 
      views_included, 
      leads_included,
      views_used,
      leads_used,
      current_period_start,
      current_period_end,
      next_payment_date,
      promo_code_id,
      is_promo_subscription
    ) VALUES (
      p_user_id,
      'premium_monthly',
      'active',
      COALESCE(v_views_included, 25),
      COALESCE(v_leads_included, 25),
      0,
      0,
      v_subscription_start,
      v_subscription_end,
      v_subscription_end,
      v_promo.id,
      true
    ) ON CONFLICT (user_id, plan_id) DO UPDATE SET
      status = 'active',
      views_included = COALESCE(v_views_included, 25),
      leads_included = COALESCE(v_leads_included, 25),
      current_period_start = v_subscription_start,
      current_period_end = v_subscription_end,
      next_payment_date = v_subscription_end,
      promo_code_id = v_promo.id,
      is_promo_subscription = true;
    
    -- Add views and leads to user
    UPDATE users 
    SET available_views = available_views + COALESCE(v_views_included, 25),
        available_leads = available_leads + COALESCE(v_leads_included, 25)
    WHERE id = p_user_id;
    
    -- Record redemption
    INSERT INTO promo_redemptions (promo_code_id, user_id, redemption_type, subscription_months, subscription_start, subscription_end)
    VALUES (v_promo.id, p_user_id, v_promo.promo_type, 1, v_subscription_start, v_subscription_end)
    RETURNING id INTO v_redemption_id;
    
    -- Increment usage count
    UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'subscription',
      'months', 1,
      'views', COALESCE(v_views_included, 25),
      'leads', COALESCE(v_leads_included, 25)
    );
    
  ELSIF v_promo.promo_type = 'subscription_yearly_free' THEN
    v_subscription_start := NOW();
    v_subscription_end := NOW() + INTERVAL '1 year';
    
    -- Create subscription (yearly)
    INSERT INTO subscriptions (
      user_id, 
      plan_id, 
      status, 
      views_included, 
      leads_included,
      views_used,
      leads_used,
      current_period_start,
      current_period_end,
      next_payment_date,
      promo_code_id,
      is_promo_subscription
    ) VALUES (
      p_user_id,
      'premium_yearly',
      'active',
      COALESCE(v_views_included, 25) * 12,
      COALESCE(v_leads_included, 25) * 12,
      0,
      0,
      v_subscription_start,
      v_subscription_end,
      v_subscription_end,
      v_promo.id,
      true
    ) ON CONFLICT (user_id, plan_id) DO UPDATE SET
      status = 'active',
      views_included = COALESCE(v_views_included, 25) * 12,
      leads_included = COALESCE(v_leads_included, 25) * 12,
      current_period_start = v_subscription_start,
      current_period_end = v_subscription_end,
      next_payment_date = v_subscription_end,
      promo_code_id = v_promo.id,
      is_promo_subscription = true;
    
    -- Add views and leads to user
    UPDATE users 
    SET available_views = available_views + COALESCE(v_views_included, 25) * 12,
        available_leads = available_leads + COALESCE(v_leads_included, 25) * 12
    WHERE id = p_user_id;
    
    -- Record redemption
    INSERT INTO promo_redemptions (promo_code_id, user_id, redemption_type, subscription_months, subscription_start, subscription_end)
    VALUES (v_promo.id, p_user_id, v_promo.promo_type, 12, v_subscription_start, v_subscription_end)
    RETURNING id INTO v_redemption_id;
    
    -- Increment usage count
    UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'subscription',
      'months', 12,
      'views', COALESCE(v_views_included, 25) * 12,
      'leads', COALESCE(v_leads_included, 25) * 12
    );
    
  ELSIF v_promo.promo_type = 'views' THEN
    -- Add views to user
    UPDATE users 
    SET available_views = available_views + v_promo.amount
    WHERE id = p_user_id;
    
    -- Record redemption
    INSERT INTO promo_redemptions (promo_code_id, user_id, redemption_type, amount)
    VALUES (v_promo.id, p_user_id, v_promo.promo_type, v_promo.amount)
    RETURNING id INTO v_redemption_id;
    
    -- Increment usage count
    UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'views',
      'amount', v_promo.amount
    );
    
  ELSIF v_promo.promo_type = 'leads' THEN
    -- Add leads to user
    UPDATE users 
    SET available_leads = available_leads + v_promo.amount
    WHERE id = p_user_id;
    
    -- Record redemption
    INSERT INTO promo_redemptions (promo_code_id, user_id, redemption_type, amount)
    VALUES (v_promo.id, p_user_id, v_promo.promo_type, v_promo.amount)
    RETURNING id INTO v_redemption_id;
    
    -- Increment usage count
    UPDATE promo_codes SET used_count = used_count + 1 WHERE id = v_promo.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'type', 'leads',
      'amount', v_promo.amount
    );
  END IF;
  
  RETURN jsonb_build_object('success', false, 'error', 'Unknown promo type');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Promo codes: Only service role can manage
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to promo_codes" ON promo_codes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Anyone can read active promo codes (for validation)
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT USING (is_active = true);

-- Promo redemptions: Users can view their own
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions" ON promo_redemptions
  FOR SELECT USING (user_id = auth.uid());

-- Service role can manage all redemptions
CREATE POLICY "Service role full access to redemptions" ON promo_redemptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
