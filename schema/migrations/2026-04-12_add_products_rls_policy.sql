-- ============================================================================
-- ADD RLS POLICY FOR PRODUCTS TABLE
-- Allows public read access to active products for shop browsing
-- ============================================================================

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Revoke write permissions from anon role
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;

-- Grant read permission to anon and authenticated roles
GRANT SELECT ON products TO anon;
GRANT SELECT ON products TO authenticated;

-- Also ensure shops table has proper permissions for joins
GRANT SELECT ON shops TO anon;
GRANT SELECT ON shops TO authenticated;

-- Enable RLS on shops table (if not already enabled)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Create policy for public (anon) read access to active shops only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shops' 
    AND policyname = 'shops_read_active'
  ) THEN
    CREATE POLICY shops_read_active ON shops 
    FOR SELECT 
    TO anon
    USING (status = 'active');
  END IF;
END $$;

-- Create policy for authenticated users to read active shops (for browsing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shops' 
    AND policyname = 'shops_read_active_authenticated'
  ) THEN
    CREATE POLICY shops_read_active_authenticated ON shops 
    FOR SELECT 
    TO authenticated
    USING (status = 'active');
  END IF;
END $$;

-- Create policy for shop owners to read their own shop (regardless of status)
-- This allows users to check if they have a shop even if it's pending/closed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shops' 
    AND policyname = 'shops_read_own'
  ) THEN
    CREATE POLICY shops_read_own ON shops 
    FOR SELECT 
    TO authenticated
    USING (owner_id = auth.uid());
  END IF;
END $$;

-- Create policy for shop owners to manage (insert/update/delete) their own shop
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shops' 
    AND policyname = 'shops_manage_own'
  ) THEN
    CREATE POLICY shops_manage_own ON shops 
    FOR ALL 
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());
  END IF;
END $$;

-- Create policy for public (anon) read access to active products only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_read_active'
  ) THEN
    CREATE POLICY products_read_active ON products 
    FOR SELECT 
    TO anon
    USING (is_active = true);
  END IF;
END $$;

-- Also create a policy for authenticated users to read all active products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_read_all_authenticated'
  ) THEN
    CREATE POLICY products_read_all_authenticated ON products 
    FOR SELECT 
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- Create policy for shop owners to manage their own products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_manage_own'
  ) THEN
    CREATE POLICY products_manage_own ON products 
    FOR ALL 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM shops 
        WHERE shops.id = products.shop_id 
        AND shops.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM shops 
        WHERE shops.id = products.shop_id 
        AND shops.owner_id = auth.uid()
      )
    );
  END IF;
END $$;
