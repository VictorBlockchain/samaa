-- Fix: Grant missing CRUD permissions on shop-related tables.
-- The RLS hardening block in schema.sql did REVOKE ALL, and only GRANT SELECT was re-added.
-- Shop owners need INSERT/UPDATE/DELETE to manage their products.

-- ============================================================
-- GRANTS (table-level permissions must exist BEFORE RLS is checked)
-- ============================================================

-- Products table
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- Product variants table (needed for creating size/color variants)
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;

-- Product variant options table
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variant_options TO authenticated;

-- Inventory table (for managing stock)
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;

-- Cart items (for shop cart functionality)
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_carts TO authenticated;

-- Order-related tables
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;

-- Shops table — must be readable by authenticated for RLS subquery checks
GRANT SELECT ON shops TO authenticated;
GRANT SELECT ON shops TO anon;

-- Product categories (read-only)
GRANT SELECT ON product_categories TO authenticated;
GRANT SELECT ON product_categories TO anon;

-- Reviews
GRANT SELECT, INSERT, UPDATE, DELETE ON product_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shop_reviews TO authenticated;

-- Wishlists
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlists TO authenticated;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- --- shops ---
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shops_read_all" ON shops;
CREATE POLICY shops_read_all ON shops FOR SELECT USING (true);

-- --- products ---
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;
GRANT SELECT ON products TO anon;

DROP POLICY IF EXISTS "products_read_active" ON products;
CREATE POLICY products_read_active ON products FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "products_manage_own" ON products;
CREATE POLICY products_manage_own ON products FOR ALL TO authenticated
  USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- --- product_variants ---
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variants_read" ON product_variants;
CREATE POLICY product_variants_read ON product_variants FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "product_variants_manage_own" ON product_variants;
CREATE POLICY product_variants_manage_own ON product_variants FOR ALL TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM products p JOIN shops s ON s.id = p.shop_id WHERE s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT p.id FROM products p JOIN shops s ON s.id = p.shop_id WHERE s.owner_id = auth.uid()
    )
  );

-- --- product_variant_options ---
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variant_options_read" ON product_variant_options;
CREATE POLICY product_variant_options_read ON product_variant_options FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "product_variant_options_manage_own" ON product_variant_options;
CREATE POLICY product_variant_options_manage_own ON product_variant_options FOR ALL TO authenticated
  USING (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN shops s ON s.id = p.shop_id
      WHERE s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN shops s ON s.id = p.shop_id
      WHERE s.owner_id = auth.uid()
    )
  );

-- --- inventory ---
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_read" ON inventory;
CREATE POLICY inventory_read ON inventory FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "inventory_manage_own" ON inventory;
CREATE POLICY inventory_manage_own ON inventory FOR ALL TO authenticated
  USING (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN shops s ON s.id = p.shop_id
      WHERE s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    variant_id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      JOIN shops s ON s.id = p.shop_id
      WHERE s.owner_id = auth.uid()
    )
  );

-- --- product_categories ---
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_categories_read_all" ON product_categories;
CREATE POLICY product_categories_read_all ON product_categories FOR SELECT
  USING (true);

-- --- orders ---
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_read_own" ON orders;
CREATE POLICY orders_read_own ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- --- order_items ---
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_read_own" ON order_items;
CREATE POLICY order_items_read_own ON order_items FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR
    order_id IN (SELECT o.id FROM orders o JOIN shops s ON s.id = o.shop_id WHERE s.owner_id = auth.uid())
  );

-- --- wishlists ---
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_own" ON wishlists;
CREATE POLICY wishlists_own ON wishlists FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --- cart_items ---
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_own" ON cart_items;
CREATE POLICY cart_items_own ON cart_items FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- --- shopping_carts ---
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shopping_carts_own" ON shopping_carts;
CREATE POLICY shopping_carts_own ON shopping_carts FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
