-- Add RLS policy for admin_settings table to allow public read access
-- This is needed for client-side fetching of pricing and configuration data
-- Date: 2026-04-15

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. GRANT SELECT PERMISSION
-- ============================================================================

GRANT SELECT ON admin_settings TO anon;
GRANT SELECT ON admin_settings TO authenticated;

-- ============================================================================
-- 3. CREATE RLS POLICY (Idempotent)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admin_settings' AND policyname = 'Allow public read access to admin_settings'
    ) THEN
        CREATE POLICY "Allow public read access to admin_settings" ON admin_settings
            FOR SELECT
            TO public
            USING (true);
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
