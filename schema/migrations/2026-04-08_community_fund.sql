-- Migration: Community Fund, Compliments, Admin Settings, and Masjid Donations
-- Description: Adds community fund system, compliments purchases, admin pricing, and masjid donation voting

-- =====================================================
-- PART 1: Add compliments to users table
-- =====================================================

ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS available_compliments INTEGER DEFAULT 0 CHECK (available_compliments >= 0);

-- =====================================================
-- PART 2: Admin Settings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Subscription Pricing
    premium_monthly_price DECIMAL(10, 2) DEFAULT 19.99,
    premium_yearly_price DECIMAL(10, 2) DEFAULT 149.99,
    premium_monthly_likes INTEGER DEFAULT 25,
    premium_monthly_compliments INTEGER DEFAULT 25,
    premium_yearly_likes INTEGER DEFAULT 300,
    premium_yearly_compliments INTEGER DEFAULT 300,
    
    -- Likes Pricing (starts at $14.99 for 25, each tier 10% cheaper per unit)
    likes_25_price DECIMAL(10, 2) DEFAULT 14.99,
    likes_50_price DECIMAL(10, 2) DEFAULT 26.99,
    likes_100_price DECIMAL(10, 2) DEFAULT 48.99,
    likes_250_price DECIMAL(10, 2) DEFAULT 109.99,
    likes_500_price DECIMAL(10, 2) DEFAULT 196.99,
    
    -- Compliments Pricing (same scaling)
    compliments_25_price DECIMAL(10, 2) DEFAULT 14.99,
    compliments_50_price DECIMAL(10, 2) DEFAULT 26.99,
    compliments_100_price DECIMAL(10, 2) DEFAULT 48.99,
    compliments_250_price DECIMAL(10, 2) DEFAULT 109.99,
    compliments_500_price DECIMAL(10, 2) DEFAULT 196.99,
    
    -- Community Split
    community_split_percentage DECIMAL(5, 2) DEFAULT 10.00 CHECK (community_split_percentage >= 0 AND community_split_percentage <= 100),
    
    -- Stripe Integration
    stripe_monthly_price_id TEXT,
    stripe_yearly_price_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one row
    CONSTRAINT single_admin_settings_row CHECK (id IS NOT NULL)
);

-- Insert default admin settings if not exists
INSERT INTO admin_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 3: Community Fund Tables
-- =====================================================

-- Community Fund Balance (single row tracking total balance)
CREATE TABLE IF NOT EXISTS community_fund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (total_balance >= 0),
    total_donated DECIMAL(12, 2) DEFAULT 0.00 CHECK (total_donated >= 0),
    total_subscriptions_contrib DECIMAL(12, 2) DEFAULT 0.00,
    total_likes_contrib DECIMAL(12, 2) DEFAULT 0.00,
    total_compliments_contrib DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_community_fund_row CHECK (id IS NOT NULL)
);

-- Insert default community fund if not exists
INSERT INTO community_fund (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM community_fund);

-- Community Fund Transactions
CREATE TABLE IF NOT EXISTS community_fund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'donation', 'withdrawal')),
    source_type TEXT CHECK (source_type IN ('subscription', 'likes', 'compliments', 'product')),
    source_payment_id UUID REFERENCES user_payments(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_fund_transactions_type ON community_fund_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_community_fund_transactions_created ON community_fund_transactions(created_at DESC);

-- =====================================================
-- PART 4: Masjid Donation Applications
-- =====================================================

-- Create masjid_status enum type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'masjid_status') THEN
    CREATE TYPE masjid_status AS ENUM ('pending', 'approved', 'rejected', 'donated');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS masjids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Location
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Contact
    imam_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    
    -- Donation Request
    requested_amount DECIMAL(10, 2) NOT NULL CHECK (requested_amount > 0),
    donation_purpose TEXT NOT NULL,
    
    -- Media
    photos JSONB DEFAULT '[]',
    
    -- Status & Voting
    status masjid_status DEFAULT 'pending',
    vote_count INTEGER DEFAULT 0,
    
    -- Donation Tracking
    amount_donated DECIMAL(10, 2) DEFAULT 0.00,
    donation_date TIMESTAMP WITH TIME ZONE,
    donation_transaction_id UUID REFERENCES community_fund_transactions(id),
    
    -- Submitted by
    submitted_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_masjids_status ON masjids(status);
CREATE INDEX IF NOT EXISTS idx_masjids_vote_count ON masjids(vote_count DESC);

-- =====================================================
-- PART 5: Voting System
-- =====================================================

CREATE TABLE IF NOT EXISTS masjid_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(masjid_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_masjid_votes_masjid ON masjid_votes(masjid_id);
CREATE INDEX IF NOT EXISTS idx_masjid_votes_user ON masjid_votes(user_id);

-- =====================================================
-- PART 6: Update Subscriptions Table
-- =====================================================

ALTER TABLE IF EXISTS subscriptions
    ADD COLUMN IF NOT EXISTS likes_included INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS compliments_included INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS likes_used INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS compliments_used INTEGER DEFAULT 0;

-- =====================================================
-- PART 7: Update User Payments Table
-- =====================================================

ALTER TABLE IF EXISTS user_payments
    ADD COLUMN IF NOT EXISTS community_contribution DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE IF EXISTS user_payments
    DROP CONSTRAINT IF EXISTS user_payments_type_check;

ALTER TABLE IF EXISTS user_payments
    ADD CONSTRAINT user_payments_type_check 
    CHECK (type IN ('subscription', 'likes', 'compliments', 'product'));

-- =====================================================
-- PART 8: Functions
-- =====================================================

-- Function to add compliments to a user
CREATE OR REPLACE FUNCTION add_compliments(
    p_user_id UUID,
    p_compliments INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET available_compliments = available_compliments + p_compliments,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to use a compliment
CREATE OR REPLACE FUNCTION use_compliment(
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_compliments INTEGER;
BEGIN
    SELECT available_compliments INTO current_compliments FROM users WHERE id = p_user_id;
    
    IF current_compliments > 0 THEN
        UPDATE users
        SET available_compliments = available_compliments - 1,
            updated_at = NOW()
        WHERE id = p_user_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to process community contribution
CREATE OR REPLACE FUNCTION process_community_contribution(
    p_payment_id UUID,
    p_amount DECIMAL(10, 2),
    p_source_type TEXT
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_split_percentage DECIMAL(5, 2);
    v_contribution DECIMAL(10, 2);
BEGIN
    -- Get community split percentage
    SELECT community_split_percentage INTO v_split_percentage 
    FROM admin_settings LIMIT 1;
    
    v_contribution := p_amount * (v_split_percentage / 100);
    
    -- Update community fund balance
    UPDATE community_fund
    SET total_balance = total_balance + v_contribution,
        total_subscriptions_contrib = CASE WHEN p_source_type = 'subscription' 
            THEN total_subscriptions_contrib + v_contribution 
            ELSE total_subscriptions_contrib END,
        total_likes_contrib = CASE WHEN p_source_type = 'likes' 
            THEN total_likes_contrib + v_contribution 
            ELSE total_likes_contrib END,
        total_compliments_contrib = CASE WHEN p_source_type = 'compliments' 
            THEN total_compliments_contrib + v_contribution 
            ELSE total_compliments_contrib END,
        updated_at = NOW();
    
    -- Record the transaction
    INSERT INTO community_fund_transactions (amount, transaction_type, source_type, source_payment_id, description)
    VALUES (v_contribution, 'contribution', p_source_type, p_payment_id, 
            CONCAT('Community contribution from ', p_source_type, ' purchase'));
    
    RETURN v_contribution;
END;
$$ LANGUAGE plpgsql;

-- Function to donate to a masjid
CREATE OR REPLACE FUNCTION donate_to_masjid(
    p_masjid_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance DECIMAL(12, 2);
    v_transaction_id UUID;
BEGIN
    -- Check current balance
    SELECT total_balance INTO v_current_balance FROM community_fund LIMIT 1;
    
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Create transaction record
    INSERT INTO community_fund_transactions (amount, transaction_type, description)
    VALUES (p_amount, 'donation', CONCAT('Donation to masjid: ', p_masjid_id))
    RETURNING id INTO v_transaction_id;
    
    -- Update community fund
    UPDATE community_fund
    SET total_balance = total_balance - p_amount,
        total_donated = total_donated + p_amount,
        updated_at = NOW();
    
    -- Update masjid
    UPDATE masjids
    SET status = 'donated',
        amount_donated = p_amount,
        donation_date = NOW(),
        donation_transaction_id = v_transaction_id,
        updated_at = NOW()
    WHERE id = p_masjid_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to vote for a masjid
CREATE OR REPLACE FUNCTION vote_for_masjid(
    p_user_id UUID,
    p_masjid_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_already_voted BOOLEAN;
BEGIN
    -- Check if already voted
    SELECT EXISTS(
        SELECT 1 FROM masjid_votes 
        WHERE user_id = p_user_id AND masjid_id = p_masjid_id
    ) INTO v_already_voted;
    
    IF v_already_voted THEN
        RETURN FALSE;
    END IF;
    
    -- Add vote
    INSERT INTO masjid_votes (user_id, masjid_id) VALUES (p_user_id, p_masjid_id);
    
    -- Update vote count
    UPDATE masjids
    SET vote_count = vote_count + 1,
        updated_at = NOW()
    WHERE id = p_masjid_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to remove vote
CREATE OR REPLACE FUNCTION remove_vote_for_masjid(
    p_user_id UUID,
    p_masjid_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_had_voted BOOLEAN;
BEGIN
    -- Check if voted
    SELECT EXISTS(
        SELECT 1 FROM masjid_votes 
        WHERE user_id = p_user_id AND masjid_id = p_masjid_id
    ) INTO v_had_voted;
    
    IF NOT v_had_voted THEN
        RETURN FALSE;
    END IF;
    
    -- Remove vote
    DELETE FROM masjid_votes WHERE user_id = p_user_id AND masjid_id = p_masjid_id;
    
    -- Update vote count
    UPDATE masjids
    SET vote_count = GREATEST(vote_count - 1, 0),
        updated_at = NOW()
    WHERE id = p_masjid_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 9: Row Level Security
-- =====================================================

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE masjids ENABLE ROW LEVEL SECURITY;
ALTER TABLE masjid_votes ENABLE ROW LEVEL SECURITY;

-- Admin settings: readable by all authenticated users
DROP POLICY IF EXISTS "Admin settings readable by authenticated" ON admin_settings;
CREATE POLICY "Admin settings readable by authenticated"
    ON admin_settings FOR SELECT
    TO authenticated
    USING (true);

-- Community fund: readable by all authenticated users
DROP POLICY IF EXISTS "Community fund readable by authenticated" ON community_fund;
CREATE POLICY "Community fund readable by authenticated"
    ON community_fund FOR SELECT
    TO authenticated
    USING (true);

-- Community transactions: readable by authenticated
DROP POLICY IF EXISTS "Community transactions readable by authenticated" ON community_fund_transactions;
CREATE POLICY "Community transactions readable by authenticated"
    ON community_fund_transactions FOR SELECT
    TO authenticated
    USING (true);

-- Masjids: readable by all, creatable by authenticated
DROP POLICY IF EXISTS "Masjids readable by all" ON masjids;
CREATE POLICY "Masjids readable by all"
    ON masjids FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Masjids creatable by authenticated" ON masjids;
CREATE POLICY "Masjids creatable by authenticated"
    ON masjids FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Masjid votes: users can view and insert their own votes
DROP POLICY IF EXISTS "Users can view all votes" ON masjid_votes;
CREATE POLICY "Users can view all votes"
    ON masjid_votes FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own votes" ON masjid_votes;
CREATE POLICY "Users can insert their own votes"
    ON masjid_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Service role full access
DROP POLICY IF EXISTS "Service role admin_settings access" ON admin_settings;
CREATE POLICY "Service role admin_settings access"
    ON admin_settings FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role community_fund access" ON community_fund;
CREATE POLICY "Service role community_fund access"
    ON community_fund FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role community_transactions access" ON community_fund_transactions;
CREATE POLICY "Service role community_transactions access"
    ON community_fund_transactions FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role masjids access" ON masjids;
CREATE POLICY "Service role masjids access"
    ON masjids FOR ALL
    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role masjid_votes access" ON masjid_votes;
CREATE POLICY "Service role masjid_votes access"
    ON masjid_votes FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- PART 10: Triggers
-- =====================================================

CREATE OR REPLACE TRIGGER update_masjids_updated_at
    BEFORE UPDATE ON masjids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_community_fund_updated_at
    BEFORE UPDATE ON community_fund
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 11: Comments
-- =====================================================

COMMENT ON TABLE admin_settings IS 'Site-wide configuration for pricing, community split, etc.';
COMMENT ON TABLE community_fund IS 'Tracks the total community fund balance and donations';
COMMENT ON TABLE community_fund_transactions IS 'Individual transactions for community fund contributions and donations';
COMMENT ON TABLE masjids IS 'Masjid applications for receiving community fund donations';
COMMENT ON TABLE masjid_votes IS 'User votes for which masjid should receive donations';
COMMENT ON COLUMN users.available_compliments IS 'Number of compliments available for the user to send';
COMMENT ON COLUMN admin_settings.community_split_percentage IS 'Percentage of each payment that goes to community fund';
