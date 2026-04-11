-- ============================================================================
-- Quick Fix: Add Missing RLS Policies for Orders 403 Error
-- This is a non-destructive migration that only ADDS missing policies
-- Safe to run even if some policies already exist
-- ============================================================================

-- ============================================================================
-- 1. ORDERS TABLE - Add SELECT policy for shop owners
-- ============================================================================
-- Check if RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add shop owner SELECT policy (this is likely missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' 
    AND policyname = 'Shop owners can view orders'
  ) THEN
    CREATE POLICY "Shop owners can view orders" ON orders
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM shops 
          WHERE shops.id = orders.shop_id 
          AND shops.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Ensure GRANT exists
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;

-- ============================================================================
-- 2. ORDER_ITEMS TABLE - Add SELECT policy
-- ============================================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Add order items SELECT policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Users can view order items'
  ) THEN
    CREATE POLICY "Users can view order items" ON order_items
      FOR SELECT
      TO authenticated
      USING (
        -- User placed the order
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_items.order_id 
          AND orders.user_id = auth.uid()
        )
        OR
        -- User owns the shop that received the order
        EXISTS (
          SELECT 1 FROM order_items oi
          JOIN orders ON orders.id = oi.order_id
          JOIN shops ON shops.id = orders.shop_id
          WHERE oi.id = order_items.id
          AND shops.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add order items INSERT policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' 
    AND policyname = 'Users can create order items'
  ) THEN
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
  END IF;
END $$;

-- Ensure GRANT exists
GRANT SELECT, INSERT ON order_items TO authenticated;

-- ============================================================================
-- 3. PRODUCT_VARIANTS TABLE - Add SELECT policy for joins
-- ============================================================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Add product variants SELECT policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_variants' 
    AND policyname = 'Anyone can view product variants'
  ) THEN
    CREATE POLICY "Anyone can view product variants" ON product_variants
      FOR SELECT
      TO authenticated, anon
      USING (
        is_active = true 
        OR 
        EXISTS (
          SELECT 1 FROM products 
          WHERE products.id = product_variants.product_id 
          AND products.is_active = true
        )
      );
  END IF;
END $$;

-- Ensure GRANT exists
GRANT SELECT ON product_variants TO authenticated;
GRANT SELECT ON product_variants TO anon;

-- ============================================================================
-- VERIFICATION - Check what policies exist now
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== Current RLS Policies ===';
END $$;

SELECT 
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'product_variants')
ORDER BY tablename, policyname;

-- ============================================================================
-- MANUAL FIX IF THIS STILL FAILS:
-- ============================================================================
-- If you still get errors, run this in a fresh SQL Editor tab:
--
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('orders', 'order_items', 'product_variants')
-- ORDER BY tablename;
--
-- Then manually drop any conflicting policies before running this migration again.
