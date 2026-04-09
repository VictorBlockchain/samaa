-- Fix production issues: RLS policies and permissions
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. Fix users table RLS policies
-- ============================================================================

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR id = auth.uid());

-- Allow the function to insert/update (SECURITY DEFINER functions bypass RLS)
-- But we need to ensure authenticated users can call the function
GRANT EXECUTE ON FUNCTION upsert_user_minimal TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_minimal TO anon;

-- ============================================================================
-- 2. Fix cart_items table RLS
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
CREATE POLICY "Users can add to own cart" ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
CREATE POLICY "Users can update own cart" ON cart_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;
CREATE POLICY "Users can delete from own cart" ON cart_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. Grant proper permissions to authenticated users
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;

-- Grant sequence permissions (if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- 4. Verify function exists with correct signature
-- ============================================================================

-- This should already exist from schema.sql, but let's verify
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'upsert_user_minimal' 
    AND pronargs = 8
  ) THEN
    RAISE NOTICE 'Function upsert_user_minimal not found or has wrong signature. Please run schema.sql';
  ELSE
    RAISE NOTICE 'Function upsert_user_minimal exists with correct signature';
  END IF;
END $$;

-- ============================================================================
-- 5. Fix SECURITY DEFINER for functions that need to bypass RLS
-- ============================================================================

-- Make upsert_user_minimal SECURITY DEFINER so it can bypass RLS
ALTER FUNCTION upsert_user_minimal SECURITY DEFINER;

-- ============================================================================
-- Summary of fixes:
-- ============================================================================
-- 1. ✅ Added SELECT policy for users table (authenticated users can view own profile)
-- 2. ✅ Fixed cart_items RLS policies (SELECT, INSERT, UPDATE, DELETE)
-- 3. ✅ Granted proper permissions to authenticated users
-- 4. ✅ Made upsert_user_minimal SECURITY DEFINER to bypass RLS
-- 5. ✅ Granted EXECUTE permission on upsert_user_minimal function
