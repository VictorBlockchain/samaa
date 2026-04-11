-- Enable RLS on community_fund table
ALTER TABLE community_fund ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS community_fund_read_all ON community_fund;
DROP POLICY IF EXISTS community_fund_update_admin ON community_fund;

-- Allow anyone to read community fund (public access)
CREATE POLICY community_fund_read_all ON community_fund
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow authenticated users to read (backup policy)
CREATE POLICY community_fund_read_authenticated ON community_fund
    FOR SELECT TO authenticated
    USING (true);

-- Grant permissions
GRANT SELECT ON community_fund TO anon, authenticated;

-- Also fix community_fund_transactions if needed
ALTER TABLE community_fund_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_fund_transactions_read_all ON community_fund_transactions;
DROP POLICY IF EXISTS community_fund_transactions_insert_authenticated ON community_fund_transactions;

-- Allow anyone to read transactions
CREATE POLICY community_fund_transactions_read_all ON community_fund_transactions
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow authenticated users to insert transactions (for donations)
CREATE POLICY community_fund_transactions_insert_authenticated ON community_fund_transactions
    FOR INSERT TO authenticated
    WITH CHECK (true);

GRANT SELECT ON community_fund_transactions TO anon, authenticated;
GRANT INSERT ON community_fund_transactions TO authenticated;
