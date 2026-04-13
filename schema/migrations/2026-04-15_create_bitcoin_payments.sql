-- Bitcoin payment system
-- Date: 2026-04-15

-- ============================================================================
-- 1. BITCOIN PAYMENTS TABLE
-- ============================================================================

CREATE TABLE bitcoin_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'views', 'leads')),
  amount_usd DECIMAL(10, 2) NOT NULL,
  amount_satoshis INTEGER NOT NULL,
  btc_price_usd DECIMAL(10, 2) NOT NULL, -- BTC price at time of payment
  
  -- Bitcoin address
  bitcoin_address TEXT NOT NULL,
  derivation_index INTEGER NOT NULL,
  
  -- Payment status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
  txid TEXT, -- Transaction ID when paid
  confirmations INTEGER DEFAULT 0,
  
  -- What the user gets
  subscription_months INTEGER DEFAULT 0,
  views_amount INTEGER DEFAULT 0,
  leads_amount INTEGER DEFAULT 0,
  
  -- Promo code (optional)
  promo_code_id UUID REFERENCES promo_codes(id),
  
  -- Referral tracking
  referred_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'), -- Payment expires in 30 mins
  confirmed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bitcoin_payments_user ON bitcoin_payments(user_id);
CREATE INDEX idx_bitcoin_payments_address ON bitcoin_payments(bitcoin_address);
CREATE INDEX idx_bitcoin_payments_status ON bitcoin_payments(status);
CREATE INDEX idx_bitcoin_payments_created ON bitcoin_payments(created_at DESC);

-- ============================================================================
-- 2. ADD ADDRESS INDEX TRACKING TO USERS TABLE
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_btc_address_index INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- 3. FUNCTION TO GET NEXT ADDRESS INDEX
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_btc_address_index(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_index INTEGER;
BEGIN
  -- Get current index and increment
  UPDATE users 
  SET last_btc_address_index = last_btc_address_index + 1
  WHERE id = p_user_id
  RETURNING last_btc_address_index INTO next_index;
  
  RETURN next_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNCTION TO CONFIRM PAYMENT AND CREDIT USER
-- ============================================================================

CREATE OR REPLACE FUNCTION confirm_bitcoin_payment(p_payment_id UUID, p_txid TEXT)
RETURNS JSONB AS $$
DECLARE
  v_payment bitcoin_payments;
  v_user users;
  v_result JSONB;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment FROM bitcoin_payments WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  IF v_payment.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment already processed');
  END IF;
  
  -- Get user
  SELECT * INTO v_user FROM users WHERE id = v_payment.user_id;
  
  -- Update payment status
  UPDATE bitcoin_payments 
  SET 
    status = 'confirmed',
    txid = p_txid,
    confirmations = 1,
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_payment_id;
  
  -- Credit user based on payment type
  IF v_payment.payment_type = 'subscription' THEN
    -- Create or update subscription
    INSERT INTO user_subscriptions (
      user_id, 
      subscription_type,
      start_date, 
      end_date,
      is_active,
      payment_method,
      amount_paid,
      next_payment_date
    ) VALUES (
      v_user.id,
      CASE WHEN v_payment.subscription_months = 1 THEN 'monthly' ELSE 'yearly' END,
      NOW(),
      NOW() + (v_payment.subscription_months || ' months')::INTERVAL,
      true,
      'bitcoin',
      v_payment.amount_usd,
      NOW() + (v_payment.subscription_months || ' months')::INTERVAL
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      end_date = NOW() + (v_payment.subscription_months || ' months')::INTERVAL,
      is_active = true,
      next_payment_date = NOW() + (v_payment.subscription_months || ' months')::INTERVAL,
      updated_at = NOW();
    
    -- Update user subscription end date
    UPDATE users 
    SET subscription_end_date = NOW() + (v_payment.subscription_months || ' months')::INTERVAL
    WHERE id = v_user.id;
    
  ELSIF v_payment.payment_type = 'views' THEN
    -- Credit views
    UPDATE users 
    SET available_views = available_views + v_payment.views_amount
    WHERE id = v_user.id;
    
  ELSIF v_payment.payment_type = 'leads' THEN
    -- Credit leads
    UPDATE users 
    SET available_leads = available_leads + v_payment.leads_amount
    WHERE id = v_user.id;
  END IF;
  
  -- Handle referral bonus (only if no promo code was used)
  IF v_payment.referred_by IS NOT NULL AND v_payment.promo_code_id IS NULL THEN
    -- Credit referrer with 10% cash bonus
    UPDATE users 
    SET 
      total_cash_earned = total_cash_earned + (v_payment.amount_usd * 0.10),
      pending_cash = pending_cash + (v_payment.amount_usd * 0.10)
    WHERE id = v_payment.referred_by;
    
    -- Update referral record
    UPDATE referrals 
    SET 
      cash_awarded = cash_awarded + (v_payment.amount_usd * 0.10),
      cash_pending = cash_pending + (v_payment.amount_usd * 0.10),
      updated_at = NOW()
    WHERE referred_user_id = v_user.id AND referrer_id = v_payment.referred_by;
  END IF;
  
  -- Mark promo code as used if applicable
  IF v_payment.promo_code_id IS NOT NULL THEN
    UPDATE promo_codes 
    SET 
      used_count = used_count + 1,
      updated_at = NOW()
    WHERE id = v_payment.promo_code_id;
    
    -- Record redemption
    INSERT INTO promo_redemptions (
      promo_code_id,
      user_id,
      redemption_type,
      amount,
      subscription_months
    ) VALUES (
      v_payment.promo_code_id,
      v_user.id,
      v_payment.payment_type,
      v_payment.amount_usd::INTEGER,
      v_payment.subscription_months
    );
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'txid', p_txid,
    'payment_type', v_payment.payment_type,
    'amount_usd', v_payment.amount_usd
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE bitcoin_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own bitcoin payments"
  ON bitcoin_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all payments
CREATE POLICY "Service role can manage all bitcoin payments"
  ON bitcoin_payments
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON bitcoin_payments TO authenticated;
GRANT ALL ON bitcoin_payments TO service_role;
