-- Bitcoin Payment Splitting System
-- Date: 2026-04-15

-- ============================================================================
-- 1. UPDATE ADMIN_SETTINGS TABLE
-- ============================================================================

ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS admin_master_private_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS admin_payout_address TEXT,
ADD COLUMN IF NOT EXISTS community_btc_address TEXT,
ADD COLUMN IF NOT EXISTS community_private_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS shop_split_percentage DECIMAL(5, 2) DEFAULT 10.00;

-- ============================================================================
-- 2. UPDATE USERS TABLE
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS btc_address TEXT,
ADD COLUMN IF NOT EXISTS btc_private_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS btc_balance_satoshis INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS btc_address_index INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- 3. UPDATE BITCOIN_PAYMENTS TABLE
-- ============================================================================

ALTER TABLE bitcoin_payments
ADD COLUMN IF NOT EXISTS payment_address TEXT,
ADD COLUMN IF NOT EXISTS split_admin_satoshis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS split_community_satoshis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS split_referral_satoshis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS split_seller_satoshis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_txid TEXT,
ADD COLUMN IF NOT EXISTS community_txid TEXT,
ADD COLUMN IF NOT EXISTS referral_txid TEXT,
ADD COLUMN IF NOT EXISTS seller_txid TEXT;

-- ============================================================================
-- 4. CREATE BITCOIN_TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE bitcoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- Transaction details
  txid TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('receive', 'send', 'referral_bonus', 'community_split', 'admin_fee', 'shop_payout', 'withdrawal')),
  
  -- Amounts
  amount_satoshis INTEGER NOT NULL,
  fee_satoshis INTEGER DEFAULT 0,
  
  -- Addresses
  from_address TEXT,
  to_address TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  
  -- Related payment
  payment_id UUID REFERENCES bitcoin_payments(id),
  
  -- Metadata
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_btc_transactions_user ON bitcoin_transactions(user_id);
CREATE INDEX idx_btc_transactions_txid ON bitcoin_transactions(txid);
CREATE INDEX idx_btc_transactions_type ON bitcoin_transactions(type);
CREATE INDEX idx_btc_transactions_status ON bitcoin_transactions(status);

-- ============================================================================
-- 5. CREATE BITCOIN_WITHDRAWALS TABLE
-- ============================================================================

CREATE TABLE bitcoin_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Withdrawal details
  amount_satoshis INTEGER NOT NULL,
  destination_address TEXT NOT NULL,
  fee_satoshis INTEGER NOT NULL,
  
  -- Transaction
  txid TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_btc_withdrawals_user ON bitcoin_withdrawals(user_id);
CREATE INDEX idx_btc_withdrawals_status ON bitcoin_withdrawals(status);

-- ============================================================================
-- 6. FUNCTIONS
-- ============================================================================

-- Generate Bitcoin keypair for user
CREATE OR REPLACE FUNCTION generate_user_btc_keypair(p_user_id UUID, p_index INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- This will be called from server-side with bitcoinjs-lib
  -- Returns address and encrypted private key
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'index', p_index,
    'success', true
  );
END;
$$ LANGUAGE plpgsql;

-- Calculate payment splits
CREATE OR REPLACE FUNCTION calculate_payment_splits(
  p_amount_satoshis INTEGER,
  p_payment_type TEXT,
  p_has_referral BOOLEAN,
  p_is_shop_payment BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_admin_satoshis INTEGER;
  v_community_satoshis INTEGER;
  v_referral_satoshis INTEGER;
  v_seller_satoshis INTEGER;
  v_community_pct DECIMAL;
  v_admin_pct DECIMAL;
  v_referral_pct DECIMAL := 10.00; -- 10% referral
BEGIN
  -- Get community split from admin settings
  SELECT community_split_percentage INTO v_community_pct 
  FROM admin_settings 
  LIMIT 1;
  
  IF v_community_pct IS NULL THEN
    v_community_pct := 10.00;
  END IF;
  
  -- Admin gets: 100% - community% - referral%(if applicable)
  -- For shop payments, admin gets service fee
  IF p_is_shop_payment THEN
    SELECT shop_split_percentage INTO v_admin_pct 
    FROM admin_settings 
    LIMIT 1;
    
    IF v_admin_pct IS NULL THEN
      v_admin_pct := 10.00;
    END IF;
    
    v_community_satoshis := FLOOR(p_amount_satoshis * v_community_pct / 100);
    v_admin_satoshis := FLOOR(p_amount_satoshis * v_admin_pct / 100);
    v_referral_satoshis := 0;
    v_seller_satoshis := p_amount_satoshis - v_community_satoshis - v_admin_satoshis;
  ELSE
    -- Regular payment (subscription/views/leads)
    v_community_satoshis := FLOOR(p_amount_satoshis * v_community_pct / 100);
    
    IF p_has_referral THEN
      v_referral_satoshis := FLOOR(p_amount_satoshis * v_referral_pct / 100);
      v_admin_satoshis := p_amount_satoshis - v_community_satoshis - v_referral_satoshis;
    ELSE
      v_referral_satoshis := 0;
      v_admin_satoshis := p_amount_satoshis - v_community_satoshis;
    END IF;
    
    v_seller_satoshis := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'admin_satoshis', v_admin_satoshis,
    'community_satoshis', v_community_satoshis,
    'referral_satoshis', v_referral_satoshis,
    'seller_satoshis', v_seller_satoshis,
    'total', v_admin_satoshis + v_community_satoshis + v_referral_satoshis + v_seller_satoshis
  );
END;
$$ LANGUAGE plpgsql;

-- Process payment splits and send BTC
CREATE OR REPLACE FUNCTION process_bitcoin_splits(p_payment_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_splits JSONB;
  v_result JSONB;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment FROM bitcoin_payments WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  -- Calculate splits
  SELECT calculate_payment_splits(
    v_payment.amount_satoshis,
    v_payment.payment_type,
    v_payment.referred_by IS NOT NULL,
    FALSE -- Not a shop payment
  ) INTO v_splits;
  
  -- Update payment with split amounts
  UPDATE bitcoin_payments
  SET 
    split_admin_satoshis = (v_splits->>'admin_satoshis')::INTEGER,
    split_community_satoshis = (v_splits->>'community_satoshis')::INTEGER,
    split_referral_satoshis = (v_splits->>'referral_satoshis')::INTEGER,
    updated_at = NOW()
  WHERE id = p_payment_id;
  
  -- Credit referral bonus to referrer's BTC balance
  IF v_payment.referred_by IS NOT NULL AND (v_splits->>'referral_satoshis')::INTEGER > 0 THEN
    UPDATE users
    SET btc_balance_satoshis = btc_balance_satoshis + (v_splits->>'referral_satoshis')::INTEGER
    WHERE id = v_payment.referred_by;
    
    -- Record transaction
    INSERT INTO bitcoin_transactions (
      user_id,
      txid,
      type,
      amount_satoshis,
      to_address,
      status,
      payment_id,
      description
    ) VALUES (
      v_payment.referred_by,
      'REFERRAL-' || p_payment_id,
      'referral_bonus',
      (v_splits->>'referral_satoshis')::INTEGER,
      (SELECT btc_address FROM users WHERE id = v_payment.referred_by),
      'confirmed',
      p_payment_id,
      'Referral bonus from payment'
    );
  END IF;
  
  -- Admin payout will be batched and sent manually
  -- Community payout will be batched and sent manually
  
  v_result := jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'splits', v_splits
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

ALTER TABLE bitcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitcoin_withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own bitcoin transactions"
  ON bitcoin_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view their own withdrawals
CREATE POLICY "Users can view own bitcoin withdrawals"
  ON bitcoin_withdrawals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create withdrawals
CREATE POLICY "Users can create withdrawals"
  ON bitcoin_withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage bitcoin transactions"
  ON bitcoin_transactions
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage bitcoin withdrawals"
  ON bitcoin_withdrawals
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON bitcoin_transactions TO authenticated;
GRANT ALL ON bitcoin_transactions TO service_role;
GRANT SELECT, INSERT ON bitcoin_withdrawals TO authenticated;
GRANT ALL ON bitcoin_withdrawals TO service_role;
