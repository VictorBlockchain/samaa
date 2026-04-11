-- Enable RLS on masjids table
ALTER TABLE masjids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS masjids_read_approved ON masjids;
DROP POLICY IF EXISTS masjids_insert_authenticated ON masjids;
DROP POLICY IF EXISTS masjids_update_own ON masjids;
DROP POLICY IF EXISTS masjids_delete_own ON masjids;

-- Allow anyone to read approved or donated masjids
CREATE POLICY masjids_read_approved ON masjids
    FOR SELECT TO anon, authenticated
    USING (status IN ('approved', 'donated'));

-- Allow authenticated users to read all masjids (for their own pending submissions)
CREATE POLICY masjids_read_own ON masjids
    FOR SELECT TO authenticated
    USING (submitted_by = auth.uid());

-- Allow authenticated users to submit masjids
CREATE POLICY masjids_insert_authenticated ON masjids
    FOR INSERT TO authenticated
    WITH CHECK (submitted_by = auth.uid());

-- Allow users to update their own pending masjids
CREATE POLICY masjids_update_own ON masjids
    FOR UPDATE TO authenticated
    USING (submitted_by = auth.uid() AND status = 'pending');

-- Allow users to delete their own pending masjids
CREATE POLICY masjids_delete_own ON masjids
    FOR DELETE TO authenticated
    USING (submitted_by = auth.uid() AND status = 'pending');

-- Grant permissions
GRANT SELECT ON masjids TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON masjids TO authenticated;

-- Also fix masjid_votes table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masjid_votes') THEN
        -- Enable RLS
        ALTER TABLE masjid_votes ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS masjid_votes_read_all ON masjid_votes;
        DROP POLICY IF EXISTS masjid_votes_insert_own ON masjid_votes;
        DROP POLICY IF EXISTS masjid_votes_delete_own ON masjid_votes;
        
        -- Allow anyone to read votes
        CREATE POLICY masjid_votes_read_all ON masjid_votes
            FOR SELECT TO anon, authenticated
            USING (true);
        
        -- Allow authenticated users to vote
        CREATE POLICY masjid_votes_insert_own ON masjid_votes
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid());
        
        -- Allow users to remove their own votes
        CREATE POLICY masjid_votes_delete_own ON masjid_votes
            FOR DELETE TO authenticated
            USING (user_id = auth.uid());
        
        -- Grant permissions
        GRANT SELECT ON masjid_votes TO anon, authenticated;
        GRANT INSERT, DELETE ON masjid_votes TO authenticated;
    END IF;
END $$;
