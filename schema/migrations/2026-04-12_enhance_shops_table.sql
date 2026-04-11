-- ============================================================================
-- ENHANCE SHOPS TABLE FOR SAMAA MARKETPLACE
-- Adds comprehensive shop management fields including payment info, shipping, etc.
-- ============================================================================

-- Add shop category type enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shop_category_type') THEN
    CREATE TYPE shop_category_type AS ENUM (
      'bride_fashion',
      'groom_fashion',
      'womens_fashion',
      'mens_fashion',
      'wedding_gifts',
      'accessories',
      'islamic_art',
      'home_decor',
      'jewelry',
      'books_media',
      'beauty_personal_care',
      'food_beverages',
      'other'
    );
  END IF;
END $$;

-- Add new columns to shops table for enhanced functionality
ALTER TABLE shops
  -- Business/Payment Information
  ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bitcoin_address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ethereum_address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bank_account_info JSONB, -- {account_name, bank_name, account_number, routing_number, swift_code}
  
  -- Shop Category & Type
  ADD COLUMN IF NOT EXISTS shop_type shop_category_type DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS shop_category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  -- Enhanced Policies
  ADD COLUMN IF NOT EXISTS return_policy TEXT,
  ADD COLUMN IF NOT EXISTS return_policy_days INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS shipping_policy TEXT,
  ADD COLUMN IF NOT EXISTS shipping_costs JSONB, -- {domestic: {standard: 5.99, express: 15.99}, international: {...}}
  ADD COLUMN IF NOT EXISTS processing_time VARCHAR(100) DEFAULT '1-3 business days',
  ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC(10,2),
  
  -- Contact Information (flattened from JSONB for easier access)
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100),
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  
  -- Address Information (flattened from JSONB)
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_postal_code VARCHAR(20),
  
  -- Shop Statistics & Metrics
  ADD COLUMN IF NOT EXISTS total_products INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER, -- average response time
  ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) DEFAULT 100.00, -- percentage
  ADD COLUMN IF NOT EXISTS on_time_delivery_rate NUMERIC(5,2) DEFAULT 100.00,
  
  -- Shop Settings
  ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vacation_message TEXT,
  ADD COLUMN IF NOT EXISTS auto_accept_orders BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS minimum_order_amount NUMERIC(10,2) DEFAULT 0,
  
  -- SEO & Marketing
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_shops_shop_type ON shops(shop_type);
CREATE INDEX IF NOT EXISTS idx_shops_contact_email ON shops(contact_email);
CREATE INDEX IF NOT EXISTS idx_shops_status_rating ON shops(status, rating DESC);
CREATE INDEX IF NOT EXISTS idx_shops_featured_until ON shops(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shops_vacation_mode ON shops(vacation_mode) WHERE vacation_mode = TRUE;

-- ============================================================================
-- SHOP REVIEWS ENHANCEMENTS
-- ============================================================================

-- Add helpful votes and replies to shop_reviews
ALTER TABLE shop_reviews
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES auth.users(id);

-- Create index for helpful reviews
CREATE INDEX IF NOT EXISTS idx_shop_reviews_helpful ON shop_reviews(shop_id, helpful_count DESC);

-- ============================================================================
-- SHOP FOLLOWERS TABLE (for customers to follow shops)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_followers_shop_id ON shop_followers(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_followers_user_id ON shop_followers(user_id);

-- ============================================================================
-- SHOP ANALYTICS TABLE (for tracking views, clicks, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Traffic metrics
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  product_views INTEGER DEFAULT 0,
  
  -- Sales metrics
  orders_count INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  
  -- Conversion metrics
  add_to_cart_count INTEGER DEFAULT 0,
  checkout_initiated INTEGER DEFAULT 0,
  
  -- Source tracking
  traffic_sources JSONB, -- {direct: 10, search: 5, social: 3}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(shop_id, date)
);

CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_date ON shop_analytics(shop_id, date DESC);

-- ============================================================================
-- SHOP ANNOUNCEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_announcements_shop_id ON shop_announcements(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_announcements_active ON shop_announcements(shop_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE shop_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_announcements ENABLE ROW LEVEL SECURITY;

-- Shops policies (enhanced)
DROP POLICY IF EXISTS "Shops are viewable by everyone" ON shops;
CREATE POLICY "Shops are viewable by everyone"
  ON shops FOR SELECT
  USING (status = 'active' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own shop" ON shops;
CREATE POLICY "Users can create their own shop"
  ON shops FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Shop owners can update their own shop" ON shops;
CREATE POLICY "Shop owners can update their own shop"
  ON shops FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Shop owners can delete their own shop" ON shops;
CREATE POLICY "Shop owners can delete their own shop"
  ON shops FOR DELETE
  USING (owner_id = auth.uid());

-- Shop reviews policies
DROP POLICY IF EXISTS "Shop reviews are viewable by everyone" ON shop_reviews;
CREATE POLICY "Shop reviews are viewable by everyone"
  ON shop_reviews FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create shop reviews" ON shop_reviews;
CREATE POLICY "Authenticated users can create shop reviews"
  ON shop_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reviews" ON shop_reviews;
CREATE POLICY "Users can update their own reviews"
  ON shop_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Shop owners can reply to reviews" ON shop_reviews;
CREATE POLICY "Shop owners can reply to reviews"
  ON shop_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_reviews.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Shop followers policies
CREATE POLICY "Shop followers are viewable by everyone"
  ON shop_followers FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can follow/unfollow shops"
  ON shop_followers FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Shop analytics policies (only shop owners can see their analytics)
CREATE POLICY "Shop owners can view their analytics"
  ON shop_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_analytics.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Shop announcements policies
CREATE POLICY "Shop announcements are viewable by everyone"
  ON shop_announcements FOR SELECT
  TO authenticated, anon
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Shop owners can manage their announcements"
  ON shop_announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_announcements.shop_id 
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_announcements.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update shop rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE shops
    SET 
      rating = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM shop_reviews WHERE shop_id = OLD.shop_id), 0),
      total_reviews = (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = OLD.shop_id)
    WHERE id = OLD.shop_id;
    RETURN OLD;
  ELSE
    UPDATE shops
    SET 
      rating = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM shop_reviews WHERE shop_id = NEW.shop_id), 0),
      total_reviews = (SELECT COUNT(*) FROM shop_reviews WHERE shop_id = NEW.shop_id)
    WHERE id = NEW.shop_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS shop_reviews_rating_update ON shop_reviews;
CREATE TRIGGER shop_reviews_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON shop_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_rating();

-- Function to update shop product count
CREATE OR REPLACE FUNCTION update_shop_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR NEW.is_active = FALSE THEN
    UPDATE shops
    SET total_products = (SELECT COUNT(*) FROM products WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id) AND is_active = TRUE)
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  ELSE
    UPDATE shops
    SET total_products = (SELECT COUNT(*) FROM products WHERE shop_id = NEW.shop_id AND is_active = TRUE)
    WHERE id = NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_count_update ON products;
CREATE TRIGGER products_count_update
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_product_count();

-- Function to update shop sales metrics
CREATE OR REPLACE FUNCTION update_shop_sales_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE shops
    SET 
      total_sales = total_sales + 1,
      updated_at = NOW()
    WHERE id = NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_sales_update ON orders;
CREATE TRIGGER orders_sales_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION update_shop_sales_metrics();

-- Function to track shop views (call this from your application)
CREATE OR REPLACE FUNCTION increment_shop_view(p_shop_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO shop_analytics (shop_id, date, views, unique_visitors)
  VALUES (p_shop_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (shop_id, date)
  DO UPDATE SET 
    views = shop_analytics.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA - Shop Categories
-- ============================================================================

-- Note: Enum values must be added in a separate transaction before use.
-- Run these ALTER TYPE statements first, then the INSERT statements.

-- Add new values to product_category enum (run these first in separate transaction)
-- These are idempotent and safe to run multiple times
DO $$
BEGIN
  -- Add 'fashion' value to product_category enum if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'fashion'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'fashion';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'art'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'art';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'home'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'home';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'media'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'media';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'beauty'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'beauty';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'food'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'food';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'product_category'::regtype 
    AND enumlabel = 'other'
  ) THEN
    ALTER TYPE product_category ADD VALUE 'other';
  END IF;
END $$;

-- Insert default shop categories if they don't exist
-- Only use enum values that already exist in the database
INSERT INTO product_categories (name, category_type, description, is_active, sort_order)
VALUES 
  ('Bride Fashion', 'wedding_dresses', 'Wedding dresses, bridal accessories, and more', true, 1),
  ('Groom Fashion', 'mens_formal', 'Wedding suits, thobes, and groom accessories', true, 2),
  ('Womens Fashion', 'womens_clothing', 'Modest clothing, hijabs, and women accessories', true, 3),
  ('Mens Fashion', 'mens_clothing', 'Thobes, kufis, and men accessories', true, 4),
  ('Wedding Gifts', 'gifts', 'Gift items for weddings and special occasions', true, 5),
  ('Accessories', 'accessories', 'Jewelry, bags, and fashion accessories', true, 6),
  ('Islamic Art', 'home_decor', 'Calligraphy, paintings, and Islamic decor', true, 7),
  ('Home Decor', 'home_decor', 'Islamic home decorations and furnishings', true, 8),
  ('Jewelry', 'jewelry', 'Islamic jewelry and wedding rings', true, 9),
  ('Books and Media', 'books', 'Islamic books, courses, and digital content', true, 10),
  ('Beauty and Personal Care', 'perfumes_oils', 'Halal cosmetics and personal care', true, 11),
  ('Food and Beverages', 'gifts', 'Halal foods and specialty items', true, 12),
  ('Other', 'gifts', 'Other products and services', true, 99)
ON CONFLICT (name) DO NOTHING;
