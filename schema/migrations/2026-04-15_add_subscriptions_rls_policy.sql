-- Add RLS policies for subscriptions table
-- Allow users to read their own subscriptions
-- Date: 2026-04-15

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON subscriptions TO anon;
GRANT SELECT ON subscriptions TO authenticated;
GRANT INSERT ON subscriptions TO authenticated;
GRANT UPDATE ON subscriptions TO authenticated;

-- ============================================================================
-- 3. CREATE RLS POLICIES (Idempotent)
-- ============================================================================

DO $$ 
BEGIN
    -- Policy: Users can read their own subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can read own subscriptions'
    ) THEN
        CREATE POLICY "Users can read own subscriptions" ON subscriptions
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
    END IF;

    -- Policy: Users can insert their own subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert own subscriptions'
    ) THEN
        CREATE POLICY "Users can insert own subscriptions" ON subscriptions
            FOR INSERT
            TO authenticated
            WITH CHECK (user_id = auth.uid());
    END IF;

    -- Policy: Users can update their own subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscriptions'
    ) THEN
        CREATE POLICY "Users can update own subscriptions" ON subscriptions
            FOR UPDATE
            TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
