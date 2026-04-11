-- ============================================================================
-- Fix orders table RLS policies
-- ============================================================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "orders_read_all" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Shop owners can view their shop orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

-- Allow authenticated users to view their own orders (as customer)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow shop owners to view orders for their shops
CREATE POLICY "Shop owners can view their shop orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = orders.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Allow authenticated users to create orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON orders TO authenticated;

-- Note: Service role (backend) has full access by default
