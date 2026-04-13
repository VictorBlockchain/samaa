-- Bitcoin Timelock Support
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD TIMELOCK COLUMNS TO BITCOIN_PAYMENTS
-- ============================================================================

ALTER TABLE bitcoin_payments
ADD COLUMN IF NOT EXISTS is_timelocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS unlock_timestamp BIGINT,
ADD COLUMN IF NOT EXISTS unlock_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS redeem_script_encrypted TEXT,
ADD COLUMN IF NOT EXISTS timelock_type TEXT CHECK (timelock_type IN ('subscription', 'vesting', 'escrow', 'custom'));

-- ============================================================================
-- 2. CREATE TIMELOCKED_ADDRESSES TABLE
-- ============================================================================

CREATE TABLE timelocked_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Address details
  address TEXT NOT NULL UNIQUE,
  redeem_script_encrypted TEXT NOT NULL,
  public_key TEXT,
  
  -- Timelock details
  lock_time BIGINT NOT NULL,
  unlock_date TIMESTAMPTZ NOT NULL,
  timelock_type TEXT NOT NULL CHECK (timelock_type IN ('subscription', 'vesting', 'escrow', 'custom')),
  
  -- Amount expected
  expected_amount_satoshis INTEGER,
  
  -- Status
  is_funded BOOLEAN DEFAULT FALSE,
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_spent BOOLEAN DEFAULT FALSE,
  
  -- Related payment
  payment_id UUID REFERENCES bitcoin_payments(id),
  
  -- Transaction info
  funding_txid TEXT,
  spending_txid TEXT,
  
  -- Metadata
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ,
  spent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_timelocked_user ON timelocked_addresses(user_id);
CREATE INDEX idx_timelocked_address ON timelocked_addresses(address);
CREATE INDEX idx_timelocked_unlock_date ON timelocked_addresses(unlock_date);
CREATE INDEX idx_timelocked_type ON timelocked_addresses(timelock_type);
CREATE INDEX idx_timelocked_status ON timelocked_addresses(is_unlocked, is_spent);

-- ============================================================================
-- 3. CREATE FUNCTIONS
-- ============================================================================

-- Check if timelock can be unlocked
CREATE OR REPLACE FUNCTION can_unlock_timelock(p_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_unlock_date TIMESTAMPTZ;
BEGIN
  SELECT unlock_date INTO v_unlock_date
  FROM timelocked_addresses
  WHERE address = p_address;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN NOW() >= v_unlock_date;
END;
$$ LANGUAGE plpgsql;

-- Get unlockable timelocks for a user
CREATE OR REPLACE FUNCTION get_unlockable_timelocks(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  address TEXT,
  unlock_date TIMESTAMPTZ,
  expected_amount INTEGER,
  timelock_type TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id,
    ta.address,
    ta.unlock_date,
    ta.expected_amount_satoshis,
    ta.timelock_type,
    ta.description
  FROM timelocked_addresses ta
  WHERE ta.user_id = p_user_id
    AND ta.is_funded = TRUE
    AND ta.is_unlocked = FALSE
    AND ta.is_spent = FALSE
    AND ta.unlock_date <= NOW()
  ORDER BY ta.unlock_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Mark timelock as unlocked
CREATE OR REPLACE FUNCTION unlock_timelock(p_address TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Verify timelock can be unlocked
  IF NOT can_unlock_timelock(p_address) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Timelock has not expired yet'
    );
  END IF;
  
  -- Update timelock status
  UPDATE timelocked_addresses
  SET 
    is_unlocked = TRUE,
    unlocked_at = NOW()
  WHERE address = p_address;
  
  v_result := jsonb_build_object(
    'success', true,
    'address', p_address,
    'unlocked_at', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create subscription timelocks (multiple months)
CREATE OR REPLACE FUNCTION create_subscription_timelocks(
  p_user_id UUID,
  p_monthly_amount_satoshis INTEGER,
  p_months INTEGER,
  p_start_date TIMESTAMPTZ
)
RETURNS TABLE (
  address TEXT,
  unlock_date TIMESTAMPTZ,
  month_number INTEGER,
  amount INTEGER
) AS $$
DECLARE
  v_month INTEGER;
  v_unlock_date TIMESTAMPTZ;
  v_address TEXT;
BEGIN
  FOR v_month IN 1..p_months LOOP
    -- Calculate unlock date for this month
    v_unlock_date := p_start_date + (v_month - 1) * INTERVAL '1 month';
    
    -- Insert timelocked address record
    -- Note: In practice, the address and redeem_script would be generated
    -- server-side using bitcoinjs-lib and inserted here
    v_address := 'placeholder_' || gen_random_uuid(); -- Replace with actual address
    
    INSERT INTO timelocked_addresses (
      user_id,
      address,
      redeem_script_encrypted,
      lock_time,
      unlock_date,
      timelock_type,
      expected_amount_satoshis,
      description
    ) VALUES (
      p_user_id,
      v_address,
      '', -- Encrypted redeem script from bitcoinjs-lib
      EXTRACT(EPOCH FROM v_unlock_date)::BIGINT,
      v_unlock_date,
      'subscription',
      p_monthly_amount_satoshis,
      'Subscription payment - Month ' || v_month
    );
    
    RETURN NEXT;
    address := v_address;
    unlock_date := v_unlock_date;
    month_number := v_month;
    amount := p_monthly_amount_satoshis;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

ALTER TABLE timelocked_addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own timelocked addresses
CREATE POLICY "Users can view own timelocked addresses"
  ON timelocked_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage timelocked addresses"
  ON timelocked_addresses
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE ON timelocked_addresses TO authenticated;
GRANT ALL ON timelocked_addresses TO service_role;

-- ============================================================================
-- 5. COMMENTS
-- ============================================================================

COMMENT ON TABLE timelocked_addresses IS 'Bitcoin addresses with time-locked funds using CLTV';
COMMENT ON COLUMN timelocked_addresses.lock_time IS 'Unix timestamp or block height when funds unlock';
COMMENT ON COLUMN timelocked_addresses.redeem_script_encrypted IS 'AES-256 encrypted CLTV redeem script';
COMMENT ON COLUMN timelocked_addresses.timelock_type IS 'subscription=monthly releases, vesting=employee vesting, escrow=held in escrow, custom=arbitrary';
