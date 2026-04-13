-- Mahr and Purse Timelocked Bitcoin Wallets
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD MAHR AND PURSE COLUMNS TO USERS TABLE
-- ============================================================================

-- Mahr (for men) - Shows readiness for marriage commitment
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mahr_principle_address TEXT,
ADD COLUMN IF NOT EXISTS mahr_principle_address_key TEXT, -- Encrypted private key
ADD COLUMN IF NOT EXISTS mahr_unlock_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mahr_balance_satoshis INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS mahr_is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mahr_redeem_script_encrypted TEXT;

-- Purse (for women) - Shows financial savviness
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS purse_principle_address TEXT,
ADD COLUMN IF NOT EXISTS purse_principle_address_key TEXT, -- Encrypted private key
ADD COLUMN IF NOT EXISTS purse_unlock_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS purse_balance_satoshis INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purse_is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS purse_redeem_script_encrypted TEXT;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_mahr_active ON users(mahr_is_active) WHERE mahr_is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_purse_active ON users(purse_is_active) WHERE purse_is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_mahr_unlock ON users(mahr_unlock_date) WHERE mahr_unlock_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_purse_unlock ON users(purse_unlock_date) WHERE purse_unlock_date IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.mahr_principle_address IS 'Bitcoin address for Mahr timelocked wallet (men only)';
COMMENT ON COLUMN users.mahr_principle_address_key IS 'AES-256 encrypted private key for Mahr wallet';
COMMENT ON COLUMN users.mahr_unlock_date IS 'Date when Mahr funds can be transferred to bride';
COMMENT ON COLUMN users.mahr_balance_satoshis IS 'Current balance of Mahr wallet in satoshis';
COMMENT ON COLUMN users.mahr_is_active IS 'Whether Mahr wallet is active and visible on profile';
COMMENT ON COLUMN users.mahr_redeem_script_encrypted IS 'AES-256 encrypted CLTV redeem script';

COMMENT ON COLUMN users.purse_principle_address IS 'Bitcoin address for Purse timelocked wallet (women only)';
COMMENT ON COLUMN users.purse_principle_address_key IS 'AES-256 encrypted private key for Purse wallet';
COMMENT ON COLUMN users.purse_unlock_date IS 'Date when Purse funds unlock';
COMMENT ON COLUMN users.purse_balance_satoshis IS 'Current balance of Purse wallet in satoshis';
COMMENT ON COLUMN users.purse_is_active IS 'Whether Purse wallet is active and visible on profile';
COMMENT ON COLUMN users.purse_redeem_script_encrypted IS 'AES-256 encrypted CLTV redeem script';

-- ============================================================================
-- 2. CREATE MAHR_PURSE_TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE mahr_purse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Transaction type
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('mahr', 'purse')),
  
  -- Transaction details
  txid TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'unlock', 'transfer', 'withdrawal')),
  
  -- Amounts
  amount_satoshis INTEGER NOT NULL,
  fee_satoshis INTEGER DEFAULT 0,
  
  -- Addresses
  from_address TEXT,
  to_address TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  
  -- Metadata
  description TEXT,
  recipient_user_id UUID REFERENCES users(id), -- For transfer to bride
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_mahr_purse_tx_user ON mahr_purse_transactions(user_id);
CREATE INDEX idx_mahr_purse_tx_type ON mahr_purse_transactions(wallet_type, type);
CREATE INDEX idx_mahr_purse_tx_status ON mahr_purse_transactions(status);
CREATE INDEX idx_mahr_purse_tx_txid ON mahr_purse_transactions(txid);

-- Comments
COMMENT ON TABLE mahr_purse_transactions IS 'Transaction history for Mahr and Purse wallets';
COMMENT ON COLUMN mahr_purse_transactions.wallet_type IS 'mahr for men, purse for women';
COMMENT ON COLUMN mahr_purse_transactions.recipient_user_id IS 'Used when Mahr is transferred to bride';

-- ============================================================================
-- 3. CREATE FUNCTIONS
-- ============================================================================

-- Create Mahr timelocked wallet
CREATE OR REPLACE FUNCTION create_mahr_wallet(
  p_user_id UUID,
  p_unlock_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  v_user_gender TEXT;
  v_result JSONB;
BEGIN
  -- Verify user is male
  SELECT gender INTO v_user_gender FROM users WHERE id = p_user_id;
  
  IF v_user_gender != 'male' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Mahr wallets are only available for men'
    );
  END IF;
  
  -- Verify unlock date is in the future
  IF p_unlock_date <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unlock date must be in the future'
    );
  END IF;
  
  -- Update user record (address and key will be set by server-side code)
  UPDATE users
  SET 
    mahr_unlock_date = p_unlock_date,
    mahr_is_active = TRUE,
    mahr_balance_satoshis = 0
  WHERE id = p_user_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'unlock_date', p_unlock_date
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create Purse timelocked wallet
CREATE OR REPLACE FUNCTION create_purse_wallet(
  p_user_id UUID,
  p_unlock_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  v_user_gender TEXT;
  v_result JSONB;
BEGIN
  -- Verify user is female
  SELECT gender INTO v_user_gender FROM users WHERE id = p_user_id;
  
  IF v_user_gender != 'female' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Purse wallets are only available for women'
    );
  END IF;
  
  -- Verify unlock date is in the future
  IF p_unlock_date <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unlock date must be in the future'
    );
  END IF;
  
  -- Update user record (address and key will be set by server-side code)
  UPDATE users
  SET 
    purse_unlock_date = p_unlock_date,
    purse_is_active = TRUE,
    purse_balance_satoshis = 0
  WHERE id = p_user_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'unlock_date', p_unlock_date
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get users with active Mahr (for discovery)
CREATE OR REPLACE FUNCTION get_users_with_active_mahr()
RETURNS TABLE (
  user_id UUID,
  mahr_address TEXT,
  mahr_balance INTEGER,
  mahr_unlock_date TIMESTAMPTZ,
  first_name TEXT,
  age INTEGER,
  city TEXT,
  country TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.mahr_principle_address,
    u.mahr_balance_satoshis,
    u.mahr_unlock_date,
    u.first_name,
    u.age,
    u.city,
    u.country
  FROM users u
  WHERE u.mahr_is_active = TRUE
    AND u.gender = 'male'
    AND u.mahr_principle_address IS NOT NULL
  ORDER BY u.mahr_balance_satoshis DESC, u.mahr_unlock_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Get users with active Purses (for discovery)
CREATE OR REPLACE FUNCTION get_users_with_active_purses()
RETURNS TABLE (
  user_id UUID,
  purse_address TEXT,
  purse_balance INTEGER,
  purse_unlock_date TIMESTAMPTZ,
  first_name TEXT,
  age INTEGER,
  city TEXT,
  country TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.purse_principle_address,
    u.purse_balance_satoshis,
    u.purse_unlock_date,
    u.first_name,
    u.age,
    u.city,
    u.country
  FROM users u
  WHERE u.purse_is_active = TRUE
    AND u.gender = 'female'
    AND u.purse_principle_address IS NOT NULL
  ORDER BY u.purse_balance_satoshis DESC, u.purse_unlock_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id UUID,
  p_wallet_type TEXT,
  p_new_balance INTEGER
)
RETURNS VOID AS $$
BEGIN
  IF p_wallet_type = 'mahr' THEN
    UPDATE users
    SET mahr_balance_satoshis = p_new_balance
    WHERE id = p_user_id;
  ELSIF p_wallet_type = 'purse' THEN
    UPDATE users
    SET purse_balance_satoshis = p_new_balance
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

ALTER TABLE mahr_purse_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own mahr/purse transactions"
  ON mahr_purse_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage mahr/purse transactions"
  ON mahr_purse_transactions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON mahr_purse_transactions TO authenticated;
GRANT ALL ON mahr_purse_transactions TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
