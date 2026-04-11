-- ============================================================================
-- Quick Diagnostic: Check order_items table structure
-- Run this FIRST to see what's wrong
-- ============================================================================

-- Check if order_items table exists and its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'order_items';

-- Check existing policies on order_items
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'order_items';

-- Try a simple query to see the actual error
-- SELECT * FROM order_items LIMIT 1;
