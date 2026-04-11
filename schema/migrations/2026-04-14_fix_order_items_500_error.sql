-- ============================================================================
-- Complete Fix for order_items 500 Error
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Ensure RLS is enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Step 2: Add product_id column if it doesn't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE RESTRICT;

-- Step 3: Make variant_id nullable
ALTER TABLE order_items 
ALTER COLUMN variant_id DROP NOT NULL;

-- Step 4: Add check constraint (drop first if exists to avoid conflicts)
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_product_or_variant;

ALTER TABLE order_items
ADD CONSTRAINT order_items_product_or_variant CHECK (
  product_id IS NOT NULL OR variant_id IS NOT NULL
);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Step 6: Drop old policies that might be causing issues
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "order_items_read" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;

-- Step 7: Create new simplified policies
-- Policy 1: Users can view order items for orders they placed
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Policy 2: Shop owners can view order items for their shop's orders
CREATE POLICY "Shop owners can view order items" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders ON orders.id = oi.order_id
      JOIN shops ON shops.id = orders.shop_id
      WHERE oi.id = order_items.id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy 3: Users can create order items when creating their own orders
CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Step 8: Ensure GRANT permissions
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT ON order_items TO anon;

-- Step 9: Add helpful comments
COMMENT ON COLUMN order_items.product_id IS 'Product ID (used when no variant is selected)';
COMMENT ON COLUMN order_items.variant_id IS 'Product variant ID (nullable if no variant)';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify columns
SELECT 'Columns:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Verify policies
SELECT 'Policies:' as check_type;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;

-- Test query (should work without errors)
SELECT 'Test query result:' as check_type;
SELECT COUNT(*) as total_items FROM order_items;
