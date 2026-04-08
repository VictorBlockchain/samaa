-- Migration 007: Promo Codes and Cart Tables
-- Date: 2026-04-08
-- Note: This migration creates promo_codes table and updates cart structure
-- IMPORTANT: The schema.sql already has cart_items linked to shopping_carts
-- We're creating a simplified direct user->cart_items relationship for the new shop system

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE, -- NULL = platform-wide promo
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
  min_order_amount NUMERIC(10,2) DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount NUMERIC(10,2) CHECK (max_discount_amount >= 0),
  usage_limit INTEGER CHECK (usage_limit > 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_categories TEXT[], -- Array of category IDs
  applicable_products TEXT[], -- Array of product IDs (empty = all products)
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id), -- Reference to Supabase auth.users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for promo_codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid ON promo_codes(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_promo_codes_shop ON promo_codes(shop_id);

-- Add promo code fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_discount_amount NUMERIC(10,2) DEFAULT 0 CHECK (promo_discount_amount >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Create new cart_items table for the simplified shop system
-- NOTE: This replaces the old cart_items that was linked to shopping_carts
-- If the old cart_items exists, we need to drop it first
DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Direct reference to Supabase auth
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_size VARCHAR(50),
  selected_color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_size, selected_color)
);

-- Create indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- RLS Policies for promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active platform-wide promo codes
CREATE POLICY "Anyone can view active platform promos" ON promo_codes
  FOR SELECT
  USING (is_active = TRUE AND shop_id IS NULL);

-- Anyone can view active shop-specific promo codes
CREATE POLICY "Anyone can view active shop promos" ON promo_codes
  FOR SELECT
  USING (is_active = TRUE AND shop_id IS NOT NULL);

-- Shop owners can create promo codes for their shops
-- Uses auth.uid() which is the Supabase Auth user ID
CREATE POLICY "Shop owners can create promos" ON promo_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_id IS NULL OR -- Platform admin can create global promos
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Shop owners can update their own shop's promo codes
CREATE POLICY "Shop owners can update own shop promos" ON promo_codes
  FOR UPDATE
  TO authenticated
  USING (
    shop_id IS NULL OR -- Platform admin
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Shop owners can delete their own shop's promo codes
CREATE POLICY "Shop owners can delete own shop promos" ON promo_codes
  FOR DELETE
  TO authenticated
  USING (
    shop_id IS NULL OR -- Platform admin
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- RLS Policies for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own cart items
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own cart items
CREATE POLICY "Users can add to own cart" ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own cart items
CREATE POLICY "Users can update own cart" ON cart_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own cart items
CREATE POLICY "Users can delete from own cart" ON cart_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(p_promo_code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = p_promo_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'SAM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers if not exists
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- Create trigger for order number generation
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Insert sample promo codes
-- Platform-wide promo codes (shop_id is NULL)
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount for new customers - platform wide', 'percentage', 10, 50, 20, 100, NOW() + INTERVAL '90 days', TRUE),
  ('SAVE20', 'Save $20 on orders over $100 - platform wide', 'fixed', 20, 100, NULL, 50, NOW() + INTERVAL '60 days', TRUE),
  ('FLASH50', 'Flash sale: 50% off (max $30) - platform wide', 'percentage', 50, 0, 30, 25, NOW() + INTERVAL '7 days', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Shop-specific promo codes (uncomment and update shop_id when shops exist)
-- INSERT INTO promo_codes (code, description, shop_id, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until, is_active)
-- VALUES 
--   ('SHOP10', '10% off from Modest Bridal', '{shop-uuid-here}', 'percentage', 10, 30, 15, 200, NOW() + INTERVAL '30 days', TRUE),
--   ('THOBE15', '$15 off traditional thobes', '{shop-uuid-here}', 'fixed', 15, 75, NULL, 100, NOW() + INTERVAL '45 days', TRUE)
-- ON CONFLICT (code) DO NOTHING;
