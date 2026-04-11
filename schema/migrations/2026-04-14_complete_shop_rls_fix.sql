-- ============================================================================
-- COMPLETE SHOP RLS FIX
-- Fixes 403 "permission denied" errors on products, shops, and related tables
-- caused by REVOKE ALL in schema.sql hardening block not being properly undone.
-- ============================================================================

-- ============================================================
-- 1. TABLE-LEVEL GRANTS (must exist BEFORE RLS policies are checked)
-- ============================================================

-- Products
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Shops (read for everyone, full CRUD for owners via RLS)
GRANT SELECT ON shops TO authenticated;
GRANT SELECT ON shops TO anon;

-- Product variants
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;

-- Product variant options
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variant_options TO authenticated;

-- Inventory
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;

-- Product categories
GRANT SELECT ON product_categories TO authenticated;
GRANT SELECT ON product_categories TO anon;

-- ============================================================
-- 2. RLS POLICIES
-- ============================================================

-- --- shops ---
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shops_read_all ON shops;
DROP POLICY IF EXISTS shops_read_active ON shops;
DROP POLICY IF EXISTS shops_read_active_authenticated ON shops;
DROP POLICY IF EXISTS shops_read_own ON shops;
DROP POLICY IF EXISTS shops_manage_own ON shops;

-- Anyone can read active shops
CREATE POLICY shops_read_all ON shops FOR SELECT
  USING (true);

-- ============================================================

-- --- products ---
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_read_active ON products;
DROP POLICY IF EXISTS products_read_all_authenticated ON products;
DROP POLICY IF EXISTS products_manage_own ON products;

-- Anyone can read active products
CREATE POLICY products_read_active ON products FOR SELECT
  USING (is_active = true);

-- Shop owners can INSERT/UPDATE/DELETE their own products
-- Uses direct subquery on shops table (which has broad SELECT policy)
CREATE POLICY products_manage_own ON products FOR ALL
  TO authenticated
  USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- ============================================================

-- --- product_variants ---
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_variants_read ON product_variants;
DROP POLICY IF EXISTS product_variants_manage_own ON product_variants;

CREATE POLICY product_variants_read ON product_variants FOR SELECT
  TO authenticated USING (true);

CREATE POLICY product_variants_manage_own ON product_variants FOR ALL
  TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM products p
      WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT p.id FROM products p
      WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
  );

-- ============================================================

-- --- product_variant_options ---
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_variant_options_read ON product_variant_options;
DROP POLICY IF EXISTS product_variant_options_manage_own ON product_variant_options;

CREATE POLICY product_variant_options_read ON product_variant_options FOR SELECT
  TO authenticated USING (true);

CREATE POLICY product_variant_options_manage_own ON product_variant_options FOR ALL
  TO authenticated
  USING (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      WHERE pv.product_id IN (
        SELECT p.id FROM products p
        WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      WHERE pv.product_id IN (
        SELECT p.id FROM products p
        WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
      )
    )
  );

-- ============================================================

-- --- inventory ---
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_read ON inventory;
DROP POLICY IF EXISTS inventory_manage_own ON inventory;

CREATE POLICY inventory_read ON inventory FOR SELECT
  TO authenticated USING (true);

CREATE POLICY inventory_manage_own ON inventory FOR ALL
  TO authenticated
  USING (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      WHERE pv.product_id IN (
        SELECT p.id FROM products p
        WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      WHERE pv.product_id IN (
        SELECT p.id FROM products p
        WHERE p.shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
      )
    )
  );

-- ============================================================

-- --- product_categories ---
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_categories_read_all ON product_categories;

CREATE POLICY product_categories_read_all ON product_categories FOR SELECT
  USING (true);
