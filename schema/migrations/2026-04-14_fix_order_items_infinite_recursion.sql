-- ============================================================================
-- FIX: Infinite Recursion in order_items RLS Policy
-- Error code: 42P17
-- ============================================================================

-- The problem: The policy for shop owners was selecting FROM order_items
-- inside the policy FOR order_items, causing infinite recursion

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "order_items_select_customer" ON order_items;
DROP POLICY IF EXISTS "order_items_select_seller" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
DROP POLICY IF EXISTS "Shop owners can view order items" ON order_items;

-- Step 2: Create CORRECT policies (no self-referencing!)

-- Policy 1: Customers can view items for their own orders
-- This joins orders directly, no order_items in the subquery
CREATE POLICY "order_items_select_customer" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Shop owners can view items for their shop's orders
-- CORRECT: Join through orders -> shops, NO order_items reference
CREATE POLICY "order_items_select_seller" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id 
      FROM orders o
      INNER JOIN shops s ON s.id = o.shop_id
      WHERE s.owner_id = auth.uid()
    )
  );

-- Policy 3: Users can insert items for their own orders
CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Step 3: Verify policies
SELECT 'Fixed Policies:' as info;
SELECT policyname, cmd, 
  CASE 
    WHEN qual LIKE '%order_items%' THEN '❌ HAS RECURSION RISK'
    ELSE '✅ NO RECURSION'
  END as status
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;

-- Test the query that was failing
SELECT 'Testing query that was failing:' as info;
SELECT * FROM order_items WHERE order_id = 'd0f476a7-391f-44c9-8aaf-205e19f6e308';
