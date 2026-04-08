-- Users schema additions aligned with ProfileSetup UI and Mahr contract
-- Safe, incremental migration targeting existing tables defined in scripts/supabase-schema.sql

-- Ensure UUID extension exists (no-op if already created)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male','female');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Base users table definition (integrated for fresh setups)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Wallet
  mahr_principal_address TEXT,
  purse_principal_address TEXT,
  principal TEXT UNIQUE,
  mahr_xftId TEXT,
  purse_xftId TEXT,
  -- Name
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  -- Basic profile
  age INTEGER,
  gender TEXT,
  date_of_birth DATE,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_point geography(Point,4326),
  city TEXT,
  state TEXT,
  country TEXT,
  bio TEXT,
  bio_unique_score INTEGER DEFAULT 0 CHECK (bio_unique_score >= 0 AND bio_unique_score <= 100),
  -- Media & interests
  profile_photo TEXT,
  profile_photos JSONB,
  additional_photos JSONB,
  video_intro TEXT,
  voice_intro TEXT,
  interests TEXT[],
  -- Verification & ratings
  is_verified BOOLEAN DEFAULT FALSE,
  bio_rating INTEGER DEFAULT 0 CHECK (bio_rating >= 0 AND bio_rating <= 100),
  pictures_rating INTEGER DEFAULT 0 CHECK (pictures_rating >= 0 AND pictures_rating <= 100),
  response_rate INTEGER DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
  communication_rating INTEGER DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 100),
  -- Extended profile
  marital_status TEXT,
  has_children BOOLEAN DEFAULT FALSE,
  wants_children BOOLEAN DEFAULT FALSE,
  want_children TEXT,
  bio_tagline TEXT,
  education TEXT,
  profession TEXT,
  employer TEXT,
  job_title TEXT,
  ethnicity TEXT,
  nationality TEXT,
  languages TEXT[],
  religiosity TEXT,
  prayer_frequency TEXT,
  hijab_preference TEXT,
  marriage_intention TEXT,
  is_revert BOOLEAN DEFAULT FALSE,
  alcohol TEXT,
  smoking TEXT,
  psychedelics TEXT,
  halal_food TEXT,
  -- Timestamps
  last_active TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Augment users table linkage and UI naming convenience for ICP principal
ALTER TABLE IF EXISTS users
    DROP COLUMN IF EXISTS solana_address,
    ADD COLUMN IF NOT EXISTS principal TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add additional rating fields used for search and sorting
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS communication_rating INTEGER DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 100),
    ADD COLUMN IF NOT EXISTS pictures_rating INTEGER DEFAULT 0 CHECK (pictures_rating >= 0 AND pictures_rating <= 100);

-- Keep full_name in sync if first_name/last_name are present
CREATE OR REPLACE FUNCTION set_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
    NEW.full_name := CONCAT(COALESCE(NEW.first_name, ''), CASE WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN ' ' ELSE '' END, COALESCE(NEW.last_name, ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_full_name'
  ) THEN
    CREATE TRIGGER users_set_full_name
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_full_name();
  END IF;
END $$;

-- User search settings table (preferences and discovery controls)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Discovery prefs
    age_range_min INTEGER,
    age_range_max INTEGER,
    max_distance INTEGER DEFAULT 50,
    anywhere_in_world BOOLEAN DEFAULT FALSE,
    show_only_verified BOOLEAN DEFAULT FALSE,
    show_only_practicing BOOLEAN DEFAULT FALSE,
    -- Preference arrays (using TEXT[] for simplicity)
    preferred_interests TEXT[],
    preferred_religiosity TEXT[],
    preferred_prayer_frequency TEXT[],
    preferred_hijab TEXT[],
    preferred_marriage_intention TEXT[],
    preferred_nationality TEXT[],
    preferred_height_range TEXT[],
    preferred_marital_status TEXT[],
    preferred_children TEXT[],
    preferred_education TEXT[],
    -- Legacy/extra fields used by existing views/UI
    education_preference TEXT[],
    occupation_preference TEXT[],
    -- Requirements and minimums
    require_financial_setup BOOLEAN DEFAULT FALSE,
    bio_rating_minimum INTEGER DEFAULT 0,
    response_rate_minimum INTEGER DEFAULT 0,
    -- Notifications
    notifications_matches BOOLEAN DEFAULT TRUE,
    notifications_messages BOOLEAN DEFAULT TRUE,
    notifications_profile_views BOOLEAN DEFAULT TRUE,
    notifications_likes BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    -- Privacy/display
    show_age BOOLEAN DEFAULT TRUE,
    show_location BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one settings row per user
    UNIQUE(user_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_age_range ON user_settings(age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_user_settings_max_distance ON user_settings(max_distance);
CREATE INDEX IF NOT EXISTS idx_user_settings_preferred_interests ON user_settings USING GIN (preferred_interests);
CREATE INDEX IF NOT EXISTS idx_user_settings_preferred_education ON user_settings USING GIN (preferred_education);
CREATE INDEX IF NOT EXISTS idx_user_settings_preferred_religiosity ON user_settings USING GIN (preferred_religiosity);

-- Additional profile fields to align with ProfileSetup UI
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS mahr_principal_address TEXT,
    ADD COLUMN IF NOT EXISTS purse_principal_address TEXT,
    ADD COLUMN IF NOT EXISTS mahr_xftId TEXT,
    ADD COLUMN IF NOT EXISTS purse_xftId TEXT,
    ADD COLUMN IF NOT EXISTS marital_status TEXT,
    ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS wants_children BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS want_children TEXT,
    ADD COLUMN IF NOT EXISTS bio_tagline TEXT,
    ADD COLUMN IF NOT EXISTS education TEXT,
    ADD COLUMN IF NOT EXISTS profession TEXT,
    ADD COLUMN IF NOT EXISTS employer TEXT,
    ADD COLUMN IF NOT EXISTS job_title TEXT,
    ADD COLUMN IF NOT EXISTS ethnicity TEXT,
    ADD COLUMN IF NOT EXISTS nationality TEXT,
    ADD COLUMN IF NOT EXISTS languages TEXT[],
    ADD COLUMN IF NOT EXISTS religiosity TEXT,
    ADD COLUMN IF NOT EXISTS prayer_frequency TEXT,
    ADD COLUMN IF NOT EXISTS hijab_preference TEXT,
    ADD COLUMN IF NOT EXISTS marriage_intention TEXT,
    ADD COLUMN IF NOT EXISTS is_revert BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS alcohol TEXT,
    ADD COLUMN IF NOT EXISTS smoking TEXT,
    ADD COLUMN IF NOT EXISTS psychedelics TEXT,
    ADD COLUMN IF NOT EXISTS halal_food TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS additional_photos JSONB,
    ADD COLUMN IF NOT EXISTS video_intro TEXT,
    ADD COLUMN IF NOT EXISTS voice_intro TEXT,
    ADD COLUMN IF NOT EXISTS profile_photo TEXT,
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS bio_unique_score INTEGER DEFAULT 0 CHECK (bio_unique_score >= 0 AND bio_unique_score <= 100);

-- Useful indexes for efficient search
CREATE INDEX IF NOT EXISTS idx_users_location_point ON users USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_bio_rating ON users(bio_rating);
CREATE INDEX IF NOT EXISTS idx_users_response_rate ON users(response_rate);
CREATE INDEX IF NOT EXISTS idx_users_communication_rating ON users(communication_rating);
CREATE INDEX IF NOT EXISTS idx_users_pictures_rating ON users(pictures_rating);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_bio_trgm ON users USING GIN (bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_bio_unique ON users(bio_unique_score);
-- Additional indexes for common profile filters
CREATE INDEX IF NOT EXISTS idx_users_marital_status ON users(marital_status);
CREATE INDEX IF NOT EXISTS idx_users_education ON users(education);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);
CREATE INDEX IF NOT EXISTS idx_users_religiosity ON users(religiosity);
CREATE INDEX IF NOT EXISTS idx_users_prayer_frequency ON users(prayer_frequency);
CREATE INDEX IF NOT EXISTS idx_users_hijab_preference ON users(hijab_preference);
CREATE INDEX IF NOT EXISTS idx_users_marriage_intention ON users(marriage_intention);
CREATE INDEX IF NOT EXISTS idx_users_is_revert ON users(is_revert);

-- Search vector column and index for users
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION users_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.full_name, '') || ' ' || COALESCE(NEW.bio, '') || ' ' || COALESCE(array_to_string(NEW.interests, ' '), '')
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_search_vector_update'
  ) THEN
    CREATE TRIGGER users_search_vector_update
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION users_update_search_vector();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_search ON users USING GIN (search_vector);

-- Convenience view mirroring ProfileSetupPage fields and preferences
CREATE OR REPLACE VIEW user_profile_view AS
SELECT
  u.id,
  -- Wallets
  u.principal AS principal_address,
  -- Basic Info
  COALESCE(u.full_name, CONCAT(COALESCE(u.first_name, ''), CASE WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL THEN ' ' ELSE '' END, COALESCE(u.last_name, ''))) AS name,
  u.first_name,
  u.last_name,
  u.age,
  u.gender,
  u.location,
  u.bio,
  -- Additional profile fields
  u.marital_status,
  u.has_children,
  u.want_children,
  u.bio_tagline,
  u.education,
  u.profession,
  u.religiosity,
  u.prayer_frequency,
  u.hijab_preference,
  u.marriage_intention,
  u.is_revert,
  u.alcohol,
  u.smoking,
  u.psychedelics,
  u.halal_food,
  -- Media & interests
  u.profile_photos AS photos,
  u.additional_photos,
  u.video_intro,
  u.voice_intro,
  u.interests,
  -- Preferences (from user_settings)
  s.age_range_min AS preferences_age_min,
  s.age_range_max AS preferences_age_max,
  s.max_distance AS preferences_max_distance,
  COALESCE(s.preferred_education, s.education_preference) AS preferences_education,
  s.occupation_preference AS preferences_occupation,
  -- Status
  u.is_verified,
  u.bio_rating,
  u.pictures_rating,
  u.response_rate,
  u.communication_rating,
  u.bio_unique_score,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN user_settings s ON s.user_id = u.id;

-- Search helpers
-- Search by location within X miles
CREATE OR REPLACE FUNCTION search_users_by_location(
  center_lat DOUBLE PRECISION,
  center_lon DOUBLE PRECISION,
  radius_miles INTEGER
) RETURNS SETOF user_profile_view AS $$
  SELECT v.*
  FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE u.location_point IS NOT NULL
    AND ST_DWithin(
      u.location_point,
      ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
      radius_miles * 1609.34
    )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Advanced user search across profile fields and location
CREATE OR REPLACE FUNCTION search_users_advanced(
  p_gender TEXT DEFAULT NULL,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL,
  p_marital_status TEXT DEFAULT NULL,
  p_has_children BOOLEAN DEFAULT NULL,
  p_want_children TEXT DEFAULT NULL,
  p_education TEXT DEFAULT NULL,
  p_profession TEXT DEFAULT NULL,
  p_religiosity TEXT DEFAULT NULL,
  p_prayer_frequency TEXT DEFAULT NULL,
  p_hijab_preference TEXT DEFAULT NULL,
  p_marriage_intention TEXT DEFAULT NULL,
  p_is_revert BOOLEAN DEFAULT NULL,
  p_alcohol TEXT DEFAULT NULL,
  p_smoking TEXT DEFAULT NULL,
  p_psychedelics TEXT DEFAULT NULL,
  p_halal_food TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_center_lat DOUBLE PRECISION DEFAULT NULL,
  p_center_lon DOUBLE PRECISION DEFAULT NULL,
  p_radius_miles INTEGER DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'recent', -- recent, age, rating, response_rate, communication_rating, distance
  p_sort_dir TEXT DEFAULT 'desc',  -- asc/desc
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS SETOF user_profile_view AS $$
  SELECT v.*
  FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE
    (p_gender IS NULL OR u.gender = p_gender) AND
    (p_age_min IS NULL OR u.age >= p_age_min) AND
    (p_age_max IS NULL OR u.age <= p_age_max) AND
    (p_marital_status IS NULL OR u.marital_status = p_marital_status) AND
    (p_has_children IS NULL OR u.has_children = p_has_children) AND
    (p_want_children IS NULL OR u.want_children = p_want_children) AND
    (p_education IS NULL OR u.education = p_education) AND
    (p_profession IS NULL OR u.profession = p_profession) AND
    (p_religiosity IS NULL OR u.religiosity = p_religiosity) AND
    (p_prayer_frequency IS NULL OR u.prayer_frequency = p_prayer_frequency) AND
    (p_hijab_preference IS NULL OR u.hijab_preference = p_hijab_preference) AND
    (p_marriage_intention IS NULL OR u.marriage_intention = p_marriage_intention) AND
    (p_is_revert IS NULL OR u.is_revert = p_is_revert) AND
    (p_alcohol IS NULL OR u.alcohol = p_alcohol) AND
    (p_smoking IS NULL OR u.smoking = p_smoking) AND
    (p_psychedelics IS NULL OR u.psychedelics = p_psychedelics) AND
    (p_halal_food IS NULL OR u.halal_food = p_halal_food) AND
    (p_interests IS NULL OR u.interests && p_interests) AND
    (
      p_center_lat IS NULL OR p_center_lon IS NULL OR p_radius_miles IS NULL OR
      ST_DWithin(
        u.location_point,
        ST_SetSRID(ST_MakePoint(p_center_lon, p_center_lat), 4326)::geography,
        p_radius_miles * 1609.34
      )
    ) AND
    (
      p_search_text IS NULL OR
      to_tsvector('english',
        COALESCE(u.full_name, '') || ' ' ||
        COALESCE(u.bio, '') || ' ' ||
        COALESCE(array_to_string(u.interests, ' '), '')
      ) @@ plainto_tsquery('english', p_search_text)
    )
  ORDER BY
    -- Ascending
    CASE WHEN p_sort_dir = 'asc' THEN
      CASE p_sort_by
        WHEN 'age' THEN u.age::numeric
        WHEN 'rating' THEN u.bio_rating::numeric
        WHEN 'response_rate' THEN u.response_rate::numeric
        WHEN 'communication_rating' THEN u.communication_rating::numeric
        WHEN 'recent' THEN EXTRACT(EPOCH FROM u.created_at)
        WHEN 'distance' THEN CASE WHEN p_center_lat IS NOT NULL AND p_center_lon IS NOT NULL
          THEN ST_Distance(
            u.location_point,
            ST_SetSRID(ST_MakePoint(p_center_lon, p_center_lat), 4326)::geography
          )
        END
      END
    END ASC,
    -- Descending
    CASE WHEN p_sort_dir = 'desc' THEN
      CASE p_sort_by
        WHEN 'age' THEN u.age::numeric
        WHEN 'rating' THEN u.bio_rating::numeric
        WHEN 'response_rate' THEN u.response_rate::numeric
        WHEN 'communication_rating' THEN u.communication_rating::numeric
        WHEN 'recent' THEN EXTRACT(EPOCH FROM u.created_at)
        WHEN 'distance' THEN CASE WHEN p_center_lat IS NOT NULL AND p_center_lon IS NOT NULL
          THEN ST_Distance(
            u.location_point,
            ST_SetSRID(ST_MakePoint(p_center_lon, p_center_lat), 4326)::geography
          )
        END
      END
    END DESC
  LIMIT p_limit OFFSET p_offset
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- SHOP & E-COMMERCE SYSTEM
-- ============================================================================

-- Shop status enum
CREATE TYPE shop_status AS ENUM ('pending', 'active', 'suspended', 'closed');

-- Product category types for Muslim fashion and wedding items
CREATE TYPE product_category AS ENUM (
  'mens_clothing', 'womens_clothing', 'accessories', 'footwear', 'jewelry',
  'wedding_dresses', 'mens_formal', 'hijabs_scarves', 'abayas_jilbabs', 
  'thobes_kaftans', 'prayer_items', 'home_decor', 'gifts', 'books',
  'perfumes_oils', 'children_clothing', 'modest_swimwear', 'undergarments'
);

-- Product condition
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair');

-- Currency type for products/pricing
CREATE TYPE currency_type AS ENUM ('SAKK', 'SEI');

-- Order status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partially_refunded');

-- Shipping method
CREATE TYPE shipping_method AS ENUM ('standard', 'express', 'overnight', 'pickup');

-- Size system for clothing
CREATE TYPE size_system AS ENUM ('us', 'uk', 'eu', 'international', 'custom');

-- Shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status shop_status DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  address JSONB, -- {street, city, state, country, postal_code}
  contact_info JSONB, -- {phone, email, website, social_media}
  business_info JSONB, -- {license_number, tax_id, registration_date}
  policies JSONB, -- {return_policy, shipping_policy, privacy_policy}
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories table
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category_type product_category NOT NULL,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(100),
  brand VARCHAR(255),
  condition product_condition DEFAULT 'new',
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= base_price),
  cost_price NUMERIC(10,2) CHECK (cost_price >= 0),
  weight NUMERIC(8,3), -- in kg
  dimensions JSONB, -- {length, width, height} in cm
  images JSONB, -- array of image URLs
  tags TEXT[], -- for search and filtering
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  requires_shipping BOOLEAN DEFAULT TRUE,
  is_digital BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_handle VARCHAR(255) UNIQUE,
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (for size, color, style variations)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- e.g., "Large / Black", "Size 10 / Navy Blue"
  sku VARCHAR(100),
  price NUMERIC(10,2) CHECK (price >= 0),
  compare_at_price NUMERIC(10,2) CHECK (compare_at_price >= price),
  cost_price NUMERIC(10,2) CHECK (cost_price >= 0),
  weight NUMERIC(8,3),
  image_url TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variant options (size, color, material, etc.)
CREATE TABLE product_variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_name VARCHAR(100) NOT NULL, -- 'size', 'color', 'material', etc.
  option_value VARCHAR(255) NOT NULL, -- 'Large', 'Black', 'Cotton', etc.
  size_system size_system, -- only for size options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory tracking
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  location VARCHAR(255), -- warehouse/store location
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variant_id)
);

-- Shopping carts
CREATE TABLE shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cart items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, variant_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  status order_status DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount NUMERIC(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount NUMERIC(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount NUMERIC(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Shipping information
  shipping_method shipping_method,
  shipping_address JSONB NOT NULL, -- {name, street, city, state, country, postal_code, phone}
  billing_address JSONB, -- same structure as shipping_address
  
  -- Tracking
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes and metadata
  notes TEXT,
  admin_notes TEXT,
  metadata JSONB, -- for additional order data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL, -- snapshot at time of order
  variant_title VARCHAR(255) NOT NULL, -- snapshot at time of order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(100) NOT NULL, -- 'credit_card', 'paypal', 'crypto', etc.
  payment_provider VARCHAR(100), -- 'stripe', 'paypal', 'coinbase', etc.
  provider_transaction_id VARCHAR(255),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  gateway_response JSONB, -- raw response from payment gateway
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- verified purchase
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  images JSONB, -- array of review image URLs
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- one review per user per product
);

-- Shop reviews
CREATE TABLE shop_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, user_id) -- one review per user per shop
);

-- Wishlist
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- SHOP INDEXES
-- ============================================================================

-- Shops indexes
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_verified ON shops(verified);
CREATE INDEX idx_shops_rating ON shops(rating DESC);

-- Products indexes
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON product_categories(id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
-- Search vector column and index for products
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION products_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.brand, '')
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'products_search_vector_update'
  ) THEN
    CREATE TRIGGER products_search_vector_update
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION products_update_search_vector();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_is_active ON product_variants(is_active);

-- Inventory indexes
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Reviews indexes
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_shop_reviews_shop_id ON shop_reviews(shop_id);
CREATE INDEX idx_shop_reviews_user_id ON shop_reviews(user_id);

-- ============================================================================
-- SHOP TRIGGERS
-- ============================================================================

-- Updated at triggers
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON shopping_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_reviews_updated_at BEFORE UPDATE ON shop_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SHOP MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create a new shop
CREATE OR REPLACE FUNCTION create_shop(
  p_owner_id UUID,
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_contact_info JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_shop_id UUID;
BEGIN
  -- Check if user is banned
  IF is_user_banned(p_owner_id) THEN
    RAISE EXCEPTION 'User is banned and cannot create shops';
  END IF;

  INSERT INTO shops (owner_id, name, description, address, contact_info)
  VALUES (p_owner_id, p_name, p_description, p_address, p_contact_info)
  RETURNING id INTO v_shop_id;
  
  RETURN v_shop_id;
END;
$$ LANGUAGE plpgsql;

-- Add a product to a shop
CREATE OR REPLACE FUNCTION add_product(
  p_shop_id UUID,
  p_category_id UUID,
  p_name VARCHAR(255),
  p_description TEXT,
  p_base_price NUMERIC(10,2),
  p_images JSONB DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_brand VARCHAR(255) DEFAULT NULL,
  p_sku VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
  v_shop_owner UUID;
BEGIN
  -- Get shop owner
  SELECT owner_id INTO v_shop_owner FROM shops WHERE id = p_shop_id;
  
  -- Check if shop owner is banned
  IF is_user_banned(v_shop_owner) THEN
    RAISE EXCEPTION 'Shop owner is banned and cannot add products';
  END IF;

  INSERT INTO products (
    shop_id, category_id, name, description, base_price, 
    images, tags, brand, sku
  )
  VALUES (
    p_shop_id, p_category_id, p_name, p_description, p_base_price,
    p_images, p_tags, p_brand, p_sku
  )
  RETURNING id INTO v_product_id;
  
  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;

-- Add product variant
CREATE OR REPLACE FUNCTION add_product_variant(
  p_product_id UUID,
  p_title VARCHAR(255),
  p_price NUMERIC(10,2) DEFAULT NULL,
  p_sku VARCHAR(100) DEFAULT NULL,
  p_options JSONB DEFAULT NULL -- [{name: 'size', value: 'Large'}, {name: 'color', value: 'Black'}]
) RETURNS UUID AS $$
DECLARE
  v_variant_id UUID;
  v_option JSONB;
BEGIN
  INSERT INTO product_variants (product_id, title, price, sku)
  VALUES (p_product_id, p_title, p_price, p_sku)
  RETURNING id INTO v_variant_id;
  
  -- Add variant options if provided
  IF p_options IS NOT NULL THEN
    FOR v_option IN SELECT * FROM jsonb_array_elements(p_options)
    LOOP
      INSERT INTO product_variant_options (variant_id, option_name, option_value)
      VALUES (v_variant_id, v_option->>'name', v_option->>'value');
    END LOOP;
  END IF;
  
  -- Initialize inventory
  INSERT INTO inventory (variant_id, quantity)
  VALUES (v_variant_id, 0);
  
  RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Update inventory
CREATE OR REPLACE FUNCTION update_inventory(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_location VARCHAR(255) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE inventory 
  SET quantity = p_quantity,
      location = COALESCE(p_location, location),
      updated_at = NOW()
  WHERE variant_id = p_variant_id;
  
  IF NOT FOUND THEN
    INSERT INTO inventory (variant_id, quantity, location)
    VALUES (p_variant_id, p_quantity, p_location);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update cart item quantity
CREATE OR REPLACE FUNCTION update_cart_item(
  p_user_id UUID,
  p_variant_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Check if user is banned
  IF is_user_banned(p_user_id) THEN
    RAISE EXCEPTION 'User is banned and cannot modify cart';
  END IF;
  
  IF p_quantity <= 0 THEN
    -- Remove item if quantity is 0 or negative
    DELETE FROM cart_items 
    WHERE cart_id = (SELECT id FROM shopping_carts WHERE user_id = p_user_id)
      AND variant_id = p_variant_id;
  ELSE
    -- Update quantity
    UPDATE cart_items 
    SET quantity = p_quantity, updated_at = NOW()
    WHERE cart_id = (SELECT id FROM shopping_carts WHERE user_id = p_user_id)
      AND variant_id = p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Clear user cart
CREATE OR REPLACE FUNCTION clear_user_cart(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  DELETE FROM cart_items 
  WHERE cart_id = (SELECT id FROM shopping_carts WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Get product details with variants
CREATE OR REPLACE FUNCTION get_product_details(p_product_id UUID)
RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  shop_logo_url TEXT,
  product_name VARCHAR(255),
  description TEXT,
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  brand VARCHAR(255),
  condition product_condition,
  category_name VARCHAR(255),
  rating NUMERIC(3,2),
  total_reviews INTEGER,
  total_sold INTEGER,
  images JSONB,
  tags TEXT[],
  specifications JSONB,
  variants JSONB,
  shipping_info JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.shop_id,
    s.name,
    s.logo_url,
    p.name,
    p.description,
    p.base_price,
    p.compare_at_price,
    p.brand,
    p.condition,
    pc.name,
    p.rating,
    p.total_reviews,
    p.total_sold,
    p.images,
    p.tags,
    p.specifications,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', pv.id,
          'sku', pv.sku,
          'price', pv.price,
          'compare_at_price', pv.compare_at_price,
          'options', pv.variant_options,
          'weight', pv.weight,
          'dimensions', pv.dimensions,
          'stock', COALESCE(i.quantity - i.reserved_quantity, 0),
          'is_available', pv.is_active AND COALESCE(i.quantity - i.reserved_quantity, 0) > 0
        )
      ) FILTER (WHERE pv.id IS NOT NULL), 
      '[]'::jsonb
    ),
    jsonb_build_object(
      'shipping_policy', s.shipping_policy,
      'return_policy', s.return_policy,
      'business_hours', s.business_hours
    )
  FROM products p
  JOIN shops s ON s.id = p.shop_id
  LEFT JOIN product_categories pc ON pc.id = p.category_id
  LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = TRUE
  LEFT JOIN inventory i ON i.variant_id = pv.id
  WHERE p.id = p_product_id 
    AND p.is_active = TRUE 
    AND s.status = 'active'
  GROUP BY p.id, s.name, s.logo_url, s.shipping_policy, s.return_policy, s.business_hours, pc.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get order tracking details
CREATE OR REPLACE FUNCTION get_order_tracking(
  p_order_id UUID,
  p_user_id UUID
) RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  status order_status,
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  estimated_delivery DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  shipping_address JSONB,
  order_items JSONB,
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.status,
    o.tracking_number,
    o.tracking_url,
    o.estimated_delivery,
    o.shipped_at,
    o.delivered_at,
    o.shipping_address,
    jsonb_agg(
      jsonb_build_object(
        'product_name', p.name,
        'variant_options', pv.variant_options,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price,
        'image', (p.images->0)
      )
    ),
    jsonb_build_object(
      'ordered', o.created_at,
      'confirmed', CASE WHEN o.status != 'pending' THEN o.updated_at END,
      'processing', CASE WHEN o.status IN ('processing', 'shipped', 'delivered') THEN o.updated_at END,
      'shipped', o.shipped_at,
      'delivered', o.delivered_at
    )
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_variants pv ON pv.id = oi.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE o.id = p_order_id 
    AND o.user_id = p_user_id
  GROUP BY o.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get recommended products
CREATE OR REPLACE FUNCTION get_recommended_products(
  p_user_id UUID,
  p_product_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  product_name VARCHAR(255),
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2),
  images JSONB,
  recommendation_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Get products from same categories as user's previous orders or wishlist
  WITH user_interests AS (
    SELECT DISTINCT p.category_id, COUNT(*) as interest_score
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN product_variants pv ON pv.id = oi.variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE o.user_id = p_user_id
    GROUP BY p.category_id
    
    UNION ALL
    
    SELECT DISTINCT p.category_id, 1 as interest_score
    FROM wishlists w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = p_user_id
  ),
  similar_products AS (
    SELECT p.category_id, COUNT(*) as similarity_score
    FROM products p
    WHERE p.id = p_product_id
    GROUP BY p.category_id
  )
  SELECT 
    p.id,
    p.shop_id,
    s.name,
    p.name,
    p.base_price,
    p.compare_at_price,
    p.rating,
    p.images,
    CASE 
      WHEN ui.category_id IS NOT NULL THEN 'Based on your purchase history'
      WHEN sp.category_id IS NOT NULL THEN 'Similar to viewed product'
      ELSE 'Popular in your area'
    END
  FROM products p
  JOIN shops s ON s.id = p.shop_id
  LEFT JOIN user_interests ui ON ui.category_id = p.category_id
  LEFT JOIN similar_products sp ON sp.category_id = p.category_id
  WHERE p.is_active = TRUE 
    AND s.status = 'active'
    AND p.id != COALESCE(p_product_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND NOT EXISTS (
      SELECT 1 FROM orders o2
      JOIN order_items oi2 ON oi2.order_id = o2.id
      JOIN product_variants pv2 ON pv2.id = oi2.variant_id
      WHERE pv2.product_id = p.id AND o2.user_id = p_user_id
    )
  ORDER BY 
    COALESCE(ui.interest_score, 0) + COALESCE(sp.similarity_score, 0) DESC,
    p.rating DESC,
    p.total_sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Apply discount/coupon to order
CREATE OR REPLACE FUNCTION apply_discount_to_order(
  p_order_id UUID,
  p_discount_code VARCHAR(50),
  p_discount_amount NUMERIC(10,2),
  p_discount_type VARCHAR(20) -- 'percentage' or 'fixed'
) RETURNS NUMERIC(10,2) AS $$
DECLARE
  v_original_amount NUMERIC(10,2);
  v_discount_amount NUMERIC(10,2);
  v_final_amount NUMERIC(10,2);
BEGIN
  -- Get original order amount
  SELECT total_amount INTO v_original_amount
  FROM orders WHERE id = p_order_id;
  
  -- Calculate discount
  IF p_discount_type = 'percentage' THEN
    v_discount_amount := v_original_amount * (p_discount_amount / 100);
  ELSE
    v_discount_amount := p_discount_amount;
  END IF;
  
  -- Ensure discount doesn't exceed order amount
  v_discount_amount := LEAST(v_discount_amount, v_original_amount);
  v_final_amount := v_original_amount - v_discount_amount;
  
  -- Update order
  UPDATE orders 
  SET total_amount = v_final_amount,
      discount_code = p_discount_code,
      discount_amount = v_discount_amount,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN v_final_amount;
END;
$$ LANGUAGE plpgsql;

-- Get shop products with filters
CREATE OR REPLACE FUNCTION get_shop_products(
  p_shop_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'newest', -- 'newest', 'price_asc', 'price_desc', 'rating', 'popular'
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  description TEXT,
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2),
  total_reviews INTEGER,
  total_sold INTEGER,
  images JSONB,
  tags TEXT[],
  min_variant_price NUMERIC(10,2),
  max_variant_price NUMERIC(10,2),
  available_variants INTEGER
) AS $$
DECLARE
  v_order_clause TEXT;
BEGIN
  -- Build order clause
  CASE p_sort_by
    WHEN 'price_asc' THEN v_order_clause := 'p.base_price ASC';
    WHEN 'price_desc' THEN v_order_clause := 'p.base_price DESC';
    WHEN 'rating' THEN v_order_clause := 'p.rating DESC, p.total_reviews DESC';
    WHEN 'popular' THEN v_order_clause := 'p.total_sold DESC, p.view_count DESC';
    ELSE v_order_clause := 'p.created_at DESC';
  END CASE;

  RETURN QUERY EXECUTE format('
    SELECT 
      p.id, p.name, p.description, p.base_price, p.compare_at_price,
      p.rating, p.total_reviews, p.total_sold, p.images, p.tags,
      COALESCE(MIN(pv.price), p.base_price),
      COALESCE(MAX(pv.price), p.base_price),
      COUNT(DISTINCT CASE WHEN pv.is_active AND COALESCE(i.quantity - i.reserved_quantity, 0) > 0 THEN pv.id END)::INTEGER
    FROM products p
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    LEFT JOIN inventory i ON i.variant_id = pv.id
    WHERE p.shop_id = $1
      AND p.is_active = TRUE
      AND ($2 IS NULL OR p.category_id = $2)
      AND ($3 IS NULL OR p.base_price >= $3)
      AND ($4 IS NULL OR p.base_price <= $4)
    GROUP BY p.id
    ORDER BY %s
    LIMIT $5 OFFSET $6
  ', v_order_clause)
  USING p_shop_id, p_category_id, p_min_price, p_max_price, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user purchase history
CREATE OR REPLACE FUNCTION get_user_purchase_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  shop_name VARCHAR(255),
  order_date TIMESTAMP WITH TIME ZONE,
  status order_status,
  total_amount NUMERIC(10,2),
  item_count INTEGER,
  can_review BOOLEAN,
  can_reorder BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    s.name,
    o.created_at,
    o.status,
    o.total_amount,
    COUNT(oi.id)::INTEGER,
    (o.status = 'delivered' AND o.delivered_at > NOW() - INTERVAL '30 days')::BOOLEAN,
    (o.status IN ('delivered', 'cancelled'))::BOOLEAN
  FROM orders o
  JOIN shops s ON s.id = o.shop_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.user_id = p_user_id
  GROUP BY o.id, s.name
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ORDER MANAGEMENT & PAYMENT FUNCTIONS
-- ============================================================================

-- Update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status order_status,
  p_tracking_number VARCHAR(255) DEFAULT NULL,
  p_tracking_url TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE orders 
  SET status = p_status,
      tracking_number = COALESCE(p_tracking_number, tracking_number),
      tracking_url = COALESCE(p_tracking_url, tracking_url),
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Update inventory when order is delivered or cancelled
  IF p_status = 'delivered' THEN
    -- Reduce actual inventory and reserved quantity
    UPDATE inventory 
    SET quantity = quantity - oi.quantity,
        reserved_quantity = reserved_quantity - oi.quantity
    FROM order_items oi
    WHERE inventory.variant_id = oi.variant_id AND oi.order_id = p_order_id;
    
    -- Update product sales count
    UPDATE products 
    SET total_sold = total_sold + oi.quantity
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.variant_id
    WHERE products.id = pv.product_id AND oi.order_id = p_order_id;
    
  ELSIF p_status = 'cancelled' THEN
    -- Release reserved inventory
    UPDATE inventory 
    SET reserved_quantity = reserved_quantity - oi.quantity
    FROM order_items oi
    WHERE inventory.variant_id = oi.variant_id AND oi.order_id = p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Process payment
CREATE OR REPLACE FUNCTION process_payment(
  p_order_id UUID,
  p_payment_method VARCHAR(100),
  p_payment_provider VARCHAR(100),
  p_provider_transaction_id VARCHAR(255),
  p_amount NUMERIC(10,2),
  p_gateway_response JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  INSERT INTO payments (
    order_id, payment_method, payment_provider, provider_transaction_id,
    amount, status, gateway_response, processed_at
  )
  VALUES (
    p_order_id, p_payment_method, p_payment_provider, p_provider_transaction_id,
    p_amount, 'completed', p_gateway_response, NOW()
  )
  RETURNING id INTO v_payment_id;
  
  -- Update order status to confirmed if payment successful
  UPDATE orders SET status = 'confirmed' WHERE id = p_order_id AND status = 'pending';
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- Get user orders
CREATE OR REPLACE FUNCTION get_user_orders(
  p_user_id UUID,
  p_status order_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  shop_name VARCHAR(255),
  status order_status,
  total_amount NUMERIC(10,2),
  item_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  estimated_delivery DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    s.name,
    o.status,
    o.total_amount,
    COUNT(oi.id)::INTEGER,
    o.created_at,
    o.estimated_delivery
  FROM orders o
  JOIN shops s ON s.id = o.shop_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.user_id = p_user_id
    AND (p_status IS NULL OR o.status = p_status)
  GROUP BY o.id, s.name
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get shop orders (for shop owners)
CREATE OR REPLACE FUNCTION get_shop_orders(
  p_shop_id UUID,
  p_status order_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR(50),
  customer_name VARCHAR(255),
  status order_status,
  total_amount NUMERIC(10,2),
  item_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  shipping_address JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    COALESCE(u.full_name, u.first_name),
    o.status,
    o.total_amount,
    COUNT(oi.id)::INTEGER,
    o.created_at,
    o.shipping_address
  FROM orders o
  JOIN users u ON u.id = o.user_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.shop_id = p_shop_id
    AND (p_status IS NULL OR o.status = p_status)
  GROUP BY o.id, u.full_name, u.first_name
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- WISHLIST & FAVORITES FUNCTIONS
-- ============================================================================

-- Add to wishlist
CREATE OR REPLACE FUNCTION add_to_wishlist(
  p_user_id UUID,
  p_product_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO wishlists (user_id, product_id)
  VALUES (p_user_id, p_product_id)
  ON CONFLICT (user_id, product_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Remove from wishlist
CREATE OR REPLACE FUNCTION remove_from_wishlist(
  p_user_id UUID,
  p_product_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM wishlists 
  WHERE user_id = p_user_id AND product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Get user wishlist
CREATE OR REPLACE FUNCTION get_user_wishlist(p_user_id UUID)
RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  product_name VARCHAR(255),
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2),
  images JSONB,
  added_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.shop_id,
    s.name,
    p.name,
    p.base_price,
    p.compare_at_price,
    p.rating,
    p.images,
    w.added_at
  FROM wishlists w
  JOIN products p ON p.id = w.product_id
  JOIN shops s ON s.id = p.shop_id
  WHERE w.user_id = p_user_id
    AND p.is_active = TRUE
    AND s.status = 'active'
  ORDER BY w.added_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SHOP ANALYTICS & REPORTING FUNCTIONS
-- ============================================================================

-- Get shop analytics
CREATE OR REPLACE FUNCTION get_shop_analytics(
  p_shop_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  total_orders INTEGER,
  total_revenue NUMERIC(10,2),
  total_products INTEGER,
  active_products INTEGER,
  avg_order_value NUMERIC(10,2),
  top_selling_product VARCHAR(255),
  pending_orders INTEGER,
  processing_orders INTEGER,
  shipped_orders INTEGER,
  delivered_orders INTEGER
) AS $$
DECLARE
  v_start_date DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT o.id)::INTEGER,
    COALESCE(SUM(o.total_amount), 0),
    COUNT(DISTINCT p.id)::INTEGER,
    COUNT(DISTINCT CASE WHEN p.is_active THEN p.id END)::INTEGER,
    COALESCE(AVG(o.total_amount), 0),
    (SELECT p2.name FROM products p2 WHERE p2.shop_id = p_shop_id ORDER BY p2.total_sold DESC LIMIT 1),
    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END)::INTEGER,
    COUNT(DISTINCT CASE WHEN o.status = 'processing' THEN o.id END)::INTEGER,
    COUNT(DISTINCT CASE WHEN o.status = 'shipped' THEN o.id END)::INTEGER,
    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END)::INTEGER
  FROM shops s
  LEFT JOIN products p ON p.shop_id = s.id
  LEFT JOIN orders o ON o.shop_id = s.id 
    AND o.created_at::DATE BETWEEN v_start_date AND v_end_date
  WHERE s.id = p_shop_id
  GROUP BY s.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get product performance
CREATE OR REPLACE FUNCTION get_product_performance(
  p_shop_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  total_sold INTEGER,
  total_revenue NUMERIC(10,2),
  avg_rating NUMERIC(3,2),
  total_reviews INTEGER,
  view_count INTEGER,
  inventory_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.total_sold,
    COALESCE(SUM(oi.total_price), 0),
    p.rating,
    p.total_reviews,
    p.view_count,
    COALESCE(SUM(i.quantity), 0)::INTEGER
  FROM products p
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  LEFT JOIN inventory i ON i.variant_id = pv.id
  LEFT JOIN order_items oi ON oi.variant_id = pv.id
  LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'delivered'
  WHERE p.shop_id = p_shop_id
  GROUP BY p.id
  ORDER BY p.total_sold DESC, total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- CATEGORY MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create product category
CREATE OR REPLACE FUNCTION create_product_category(
  p_name VARCHAR(255),
  p_category_type product_category,
  p_parent_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
BEGIN
  INSERT INTO product_categories (name, category_type, parent_id, description, image_url)
  VALUES (p_name, p_category_type, p_parent_id, p_description, p_image_url)
  RETURNING id INTO v_category_id;
  
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- Get category hierarchy
CREATE OR REPLACE FUNCTION get_category_hierarchy()
RETURNS TABLE (
  category_id UUID,
  name VARCHAR(255),
  category_type product_category,
  parent_id UUID,
  description TEXT,
  image_url TEXT,
  product_count INTEGER,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
      pc.id, pc.name, pc.category_type, pc.parent_id, pc.description, 
      pc.image_url, pc.sort_order, 0 as level
    FROM product_categories pc
    WHERE pc.parent_id IS NULL AND pc.is_active = TRUE
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
      pc.id, pc.name, pc.category_type, pc.parent_id, pc.description,
      pc.image_url, pc.sort_order, ct.level + 1
    FROM product_categories pc
    JOIN category_tree ct ON pc.parent_id = ct.id
    WHERE pc.is_active = TRUE
  )
  SELECT 
    ct.id,
    ct.name,
    ct.category_type,
    ct.parent_id,
    ct.description,
    ct.image_url,
    COUNT(p.id)::INTEGER,
    ct.sort_order
  FROM category_tree ct
  LEFT JOIN products p ON p.category_id = ct.id AND p.is_active = TRUE
  GROUP BY ct.id, ct.name, ct.category_type, ct.parent_id, ct.description, ct.image_url, ct.sort_order, ct.level
  ORDER BY ct.level, ct.sort_order, ct.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SEARCH & DISCOVERY FUNCTIONS
-- ============================================================================

-- Advanced product search with full-text search
CREATE OR REPLACE FUNCTION search_products_advanced(
  p_search_term TEXT,
  p_category_ids UUID[] DEFAULT NULL,
  p_shop_ids UUID[] DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_conditions product_condition[] DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'relevance', -- 'relevance', 'price_asc', 'price_desc', 'rating', 'newest'
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  product_name VARCHAR(255),
  description TEXT,
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  brand VARCHAR(255),
  condition product_condition,
  rating NUMERIC(3,2),
  total_reviews INTEGER,
  images JSONB,
  tags TEXT[],
  relevance_score REAL
) AS $$
DECLARE
  v_order_clause TEXT;
BEGIN
  -- Build order clause
  CASE p_sort_by
    WHEN 'price_asc' THEN v_order_clause := 'p.base_price ASC';
    WHEN 'price_desc' THEN v_order_clause := 'p.base_price DESC';
    WHEN 'rating' THEN v_order_clause := 'p.rating DESC, p.total_reviews DESC';
    WHEN 'newest' THEN v_order_clause := 'p.created_at DESC';
    ELSE v_order_clause := 'ts_rank(search_vector, plainto_tsquery(''english'', $1)) DESC';
  END CASE;

  RETURN QUERY EXECUTE format('
    SELECT 
      p.id, p.shop_id, s.name, p.name, p.description, p.base_price, 
      p.compare_at_price, p.brand, p.condition, p.rating, p.total_reviews,
      p.images, p.tags,
      ts_rank(to_tsvector(''english'', p.name || '' '' || COALESCE(p.description, '''') || '' '' || COALESCE(p.brand, '''')), plainto_tsquery(''english'', $1))::REAL
    FROM products p
    JOIN shops s ON s.id = p.shop_id
    WHERE p.is_active = TRUE 
      AND s.status = ''active''
      AND ($1 IS NULL OR to_tsvector(''english'', p.name || '' '' || COALESCE(p.description, '''') || '' '' || COALESCE(p.brand, '''')) @@ plainto_tsquery(''english'', $1))
      AND ($2 IS NULL OR p.category_id = ANY($2))
      AND ($3 IS NULL OR p.shop_id = ANY($3))
      AND ($4 IS NULL OR p.base_price >= $4)
      AND ($5 IS NULL OR p.base_price <= $5)
      AND ($6 IS NULL OR p.rating >= $6)
      AND ($7 IS NULL OR p.tags && $7)
      AND ($8 IS NULL OR p.condition = ANY($8))
    ORDER BY %s
    LIMIT $9 OFFSET $10
  ', v_order_clause)
  USING p_search_term, p_category_ids, p_shop_ids, p_min_price, p_max_price, p_min_rating, p_tags, p_conditions, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get trending products
CREATE OR REPLACE FUNCTION get_trending_products(
  p_category_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  product_name VARCHAR(255),
  base_price NUMERIC(10,2),
  rating NUMERIC(3,2),
  images JSONB,
  recent_sales INTEGER,
  trend_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.shop_id,
    s.name,
    p.name,
    p.base_price,
    p.rating,
    p.images,
    COUNT(oi.id)::INTEGER,
    (COUNT(oi.id) * 0.7 + p.view_count * 0.2 + p.rating * p.total_reviews * 0.1)::NUMERIC
  FROM products p
  JOIN shops s ON s.id = p.shop_id
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  LEFT JOIN order_items oi ON oi.variant_id = pv.id
  LEFT JOIN orders o ON o.id = oi.order_id 
    AND o.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
  WHERE p.is_active = TRUE 
    AND s.status = 'active'
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  GROUP BY p.id, s.name
  ORDER BY trend_score DESC, recent_sales DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ADDITIONAL SHOP MANAGEMENT FUNCTIONS
-- ============================================================================

-- Update shop settings
CREATE OR REPLACE FUNCTION update_shop_settings(
  p_shop_id UUID,
  p_owner_id UUID,
  p_name VARCHAR(255) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_banner_url TEXT DEFAULT NULL,
  p_contact_email VARCHAR(255) DEFAULT NULL,
  p_contact_phone VARCHAR(20) DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_business_hours JSONB DEFAULT NULL,
  p_shipping_policy TEXT DEFAULT NULL,
  p_return_policy TEXT DEFAULT NULL,
  p_status shop_status DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Check if user owns the shop
  IF NOT EXISTS (SELECT 1 FROM shops WHERE id = p_shop_id AND owner_id = p_owner_id) THEN
    RAISE EXCEPTION 'Shop not found or access denied';
  END IF;
  
  UPDATE shops 
  SET name = COALESCE(p_name, name),
      description = COALESCE(p_description, description),
      logo_url = COALESCE(p_logo_url, logo_url),
      banner_url = COALESCE(p_banner_url, banner_url),
      contact_email = COALESCE(p_contact_email, contact_email),
      contact_phone = COALESCE(p_contact_phone, contact_phone),
      address = COALESCE(p_address, address),
      business_hours = COALESCE(p_business_hours, business_hours),
      shipping_policy = COALESCE(p_shipping_policy, shipping_policy),
      return_policy = COALESCE(p_return_policy, return_policy),
      status = COALESCE(p_status, status),
      updated_at = NOW()
  WHERE id = p_shop_id;
END;
$$ LANGUAGE plpgsql;

-- Update product details
CREATE OR REPLACE FUNCTION update_product(
  p_product_id UUID,
  p_shop_id UUID,
  p_name VARCHAR(255) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_base_price NUMERIC(10,2) DEFAULT NULL,
  p_compare_at_price NUMERIC(10,2) DEFAULT NULL,
  p_brand VARCHAR(255) DEFAULT NULL,
  p_condition product_condition DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_images JSONB DEFAULT NULL,
  p_specifications JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Check if product belongs to shop
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'Product not found or access denied';
  END IF;
  
  UPDATE products 
  SET name = COALESCE(p_name, name),
      description = COALESCE(p_description, description),
      base_price = COALESCE(p_base_price, base_price),
      compare_at_price = COALESCE(p_compare_at_price, compare_at_price),
      brand = COALESCE(p_brand, brand),
      condition = COALESCE(p_condition, condition),
      category_id = COALESCE(p_category_id, category_id),
      tags = COALESCE(p_tags, tags),
      images = COALESCE(p_images, images),
      specifications = COALESCE(p_specifications, specifications),
      is_active = COALESCE(p_is_active, is_active),
      updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Delete product (soft delete)
CREATE OR REPLACE FUNCTION delete_product(
  p_product_id UUID,
  p_shop_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Check if product belongs to shop
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'Product not found or access denied';
  END IF;
  
  -- Soft delete by setting is_active to false
  UPDATE products 
  SET is_active = FALSE, updated_at = NOW()
  WHERE id = p_product_id;
  
  -- Also deactivate all variants
  UPDATE product_variants 
  SET is_active = FALSE, updated_at = NOW()
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Update product variant
CREATE OR REPLACE FUNCTION update_product_variant(
  p_variant_id UUID,
  p_shop_id UUID,
  p_sku VARCHAR(100) DEFAULT NULL,
  p_price NUMERIC(10,2) DEFAULT NULL,
  p_compare_at_price NUMERIC(10,2) DEFAULT NULL,
  p_weight NUMERIC(8,3) DEFAULT NULL,
  p_dimensions JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Check if variant belongs to shop
  IF NOT EXISTS (
    SELECT 1 FROM product_variants pv 
    JOIN products p ON p.id = pv.product_id 
    WHERE pv.id = p_variant_id AND p.shop_id = p_shop_id
  ) THEN
    RAISE EXCEPTION 'Product variant not found or access denied';
  END IF;
  
  UPDATE product_variants 
  SET sku = COALESCE(p_sku, sku),
      price = COALESCE(p_price, price),
      compare_at_price = COALESCE(p_compare_at_price, compare_at_price),
      weight = COALESCE(p_weight, weight),
      dimensions = COALESCE(p_dimensions, dimensions),
      is_active = COALESCE(p_is_active, is_active),
      updated_at = NOW()
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Bulk update inventory
CREATE OR REPLACE FUNCTION bulk_update_inventory(
  p_shop_id UUID,
  p_inventory_updates JSONB -- Array of {variant_id, quantity, reserved_quantity}
) RETURNS VOID AS $$
DECLARE
  v_update JSONB;
BEGIN
  -- Loop through each inventory update
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_inventory_updates)
  LOOP
    -- Verify variant belongs to shop
    IF EXISTS (
      SELECT 1 FROM product_variants pv 
      JOIN products p ON p.id = pv.product_id 
      WHERE pv.id = (v_update->>'variant_id')::UUID AND p.shop_id = p_shop_id
    ) THEN
      -- Update inventory
      INSERT INTO inventory (variant_id, quantity, reserved_quantity)
      VALUES (
        (v_update->>'variant_id')::UUID,
        COALESCE((v_update->>'quantity')::INTEGER, 0),
        COALESCE((v_update->>'reserved_quantity')::INTEGER, 0)
      )
      ON CONFLICT (variant_id) DO UPDATE SET
        quantity = COALESCE((v_update->>'quantity')::INTEGER, inventory.quantity),
        reserved_quantity = COALESCE((v_update->>'reserved_quantity')::INTEGER, inventory.reserved_quantity),
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Get shop inventory report
CREATE OR REPLACE FUNCTION get_shop_inventory_report(
  p_shop_id UUID,
  p_low_stock_threshold INTEGER DEFAULT 10
) RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  variant_id UUID,
  variant_sku VARCHAR(100),
  variant_options JSONB,
  current_stock INTEGER,
  reserved_stock INTEGER,
  available_stock INTEGER,
  is_low_stock BOOLEAN,
  last_restocked TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    pv.id,
    pv.sku,
    pv.variant_options,
    COALESCE(i.quantity, 0),
    COALESCE(i.reserved_quantity, 0),
    COALESCE(i.quantity - i.reserved_quantity, 0),
    COALESCE(i.quantity - i.reserved_quantity, 0) <= p_low_stock_threshold,
    i.updated_at
  FROM products p
  JOIN product_variants pv ON pv.product_id = p.id
  LEFT JOIN inventory i ON i.variant_id = pv.id
  WHERE p.shop_id = p_shop_id
    AND p.is_active = TRUE
    AND pv.is_active = TRUE
  ORDER BY p.name, pv.sku;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get shop dashboard summary
CREATE OR REPLACE FUNCTION get_shop_dashboard(p_shop_id UUID)
RETURNS TABLE (
  total_products INTEGER,
  active_products INTEGER,
  low_stock_products INTEGER,
  total_orders_today INTEGER,
  total_revenue_today NUMERIC(10,2),
  pending_orders INTEGER,
  total_customers INTEGER,
  avg_rating NUMERIC(3,2),
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id)::INTEGER,
    COUNT(DISTINCT CASE WHEN p.is_active THEN p.id END)::INTEGER,
    COUNT(DISTINCT CASE WHEN COALESCE(i.quantity - i.reserved_quantity, 0) <= 10 THEN p.id END)::INTEGER,
    COUNT(DISTINCT CASE WHEN o.created_at::DATE = CURRENT_DATE THEN o.id END)::INTEGER,
    COALESCE(SUM(CASE WHEN o.created_at::DATE = CURRENT_DATE THEN o.total_amount END), 0),
    COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END)::INTEGER,
    COUNT(DISTINCT o.user_id)::INTEGER,
    COALESCE(AVG(sr.rating), 0),
    COUNT(sr.id)::INTEGER
  FROM shops s
  LEFT JOIN products p ON p.shop_id = s.id
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  LEFT JOIN inventory i ON i.variant_id = pv.id
  LEFT JOIN orders o ON o.shop_id = s.id
  LEFT JOIN shop_reviews sr ON sr.shop_id = s.id
  WHERE s.id = p_shop_id
  GROUP BY s.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SHOPPING FUNCTIONS
-- ============================================================================

-- Add item to cart
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_variant_id UUID,
  p_quantity INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
  v_cart_id UUID;
  v_available_quantity INTEGER;
BEGIN
  -- Check if user is banned
  IF is_user_banned(p_user_id) THEN
    RAISE EXCEPTION 'User is banned and cannot add items to cart';
  END IF;

  -- Check inventory
  SELECT quantity - reserved_quantity INTO v_available_quantity
  FROM inventory WHERE variant_id = p_variant_id;
  
  IF v_available_quantity < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %', v_available_quantity, p_quantity;
  END IF;

  -- Get or create cart
  SELECT id INTO v_cart_id FROM shopping_carts WHERE user_id = p_user_id;
  IF v_cart_id IS NULL THEN
    INSERT INTO shopping_carts (user_id) VALUES (p_user_id) RETURNING id INTO v_cart_id;
  END IF;
  
  -- Add or update cart item
  INSERT INTO cart_items (cart_id, variant_id, quantity)
  VALUES (v_cart_id, p_variant_id, p_quantity)
  ON CONFLICT (cart_id, variant_id) 
  DO UPDATE SET quantity = cart_items.quantity + p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Remove item from cart
CREATE OR REPLACE FUNCTION remove_from_cart(
  p_user_id UUID,
  p_variant_id UUID
) RETURNS VOID AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  SELECT id INTO v_cart_id FROM shopping_carts WHERE user_id = p_user_id;
  
  IF v_cart_id IS NOT NULL THEN
    DELETE FROM cart_items 
    WHERE cart_id = v_cart_id AND variant_id = p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get user's cart
CREATE OR REPLACE FUNCTION get_user_cart(p_user_id UUID)
RETURNS TABLE (
  item_id UUID,
  product_id UUID,
  variant_id UUID,
  product_name VARCHAR(255),
  variant_title VARCHAR(255),
  shop_name VARCHAR(255),
  unit_price NUMERIC(10,2),
  quantity INTEGER,
  total_price NUMERIC(10,2),
  image_url TEXT,
  available_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    p.id,
    pv.id,
    p.name,
    pv.title,
    s.name,
    COALESCE(pv.price, p.base_price),
    ci.quantity,
    COALESCE(pv.price, p.base_price) * ci.quantity,
    COALESCE(pv.image_url, (p.images->0)::TEXT),
    (i.quantity - i.reserved_quantity)
  FROM cart_items ci
  JOIN shopping_carts sc ON sc.id = ci.cart_id
  JOIN product_variants pv ON pv.id = ci.variant_id
  JOIN products p ON p.id = pv.product_id
  JOIN shops s ON s.id = p.shop_id
  LEFT JOIN inventory i ON i.variant_id = pv.id
  WHERE sc.user_id = p_user_id
  ORDER BY ci.added_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create order from cart
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_billing_address JSONB DEFAULT NULL,
  p_shipping_method shipping_method DEFAULT 'standard'
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR(50);
  v_cart_item RECORD;
  v_subtotal NUMERIC(10,2) := 0;
  v_shipping_amount NUMERIC(10,2) := 0;
  v_tax_amount NUMERIC(10,2) := 0;
  v_shop_id UUID;
BEGIN
  -- Check if user is banned
  IF is_user_banned(p_user_id) THEN
    RAISE EXCEPTION 'User is banned and cannot create orders';
  END IF;

  -- Generate order number
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Get first shop from cart (assuming single-shop orders for now)
  SELECT DISTINCT p.shop_id INTO v_shop_id
  FROM cart_items ci
  JOIN shopping_carts sc ON sc.id = ci.cart_id
  JOIN product_variants pv ON pv.id = ci.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE sc.user_id = p_user_id
  LIMIT 1;
  
  IF v_shop_id IS NULL THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Calculate totals
  FOR v_cart_item IN 
    SELECT ci.variant_id, ci.quantity, COALESCE(pv.price, p.base_price) as unit_price
    FROM cart_items ci
    JOIN shopping_carts sc ON sc.id = ci.cart_id
    JOIN product_variants pv ON pv.id = ci.variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE sc.user_id = p_user_id AND p.shop_id = v_shop_id
  LOOP
    v_subtotal := v_subtotal + (v_cart_item.unit_price * v_cart_item.quantity);
  END LOOP;
  
  -- Calculate shipping (simplified)
  CASE p_shipping_method
    WHEN 'express' THEN v_shipping_amount := 15.00;
    WHEN 'overnight' THEN v_shipping_amount := 25.00;
    ELSE v_shipping_amount := 5.00;
  END CASE;
  
  -- Calculate tax (simplified 8%)
  v_tax_amount := v_subtotal * 0.08;
  
  -- Create order
  INSERT INTO orders (
    order_number, user_id, shop_id, subtotal, tax_amount, 
    shipping_amount, total_amount, shipping_method, 
    shipping_address, billing_address
  )
  VALUES (
    v_order_number, p_user_id, v_shop_id, v_subtotal, v_tax_amount,
    v_shipping_amount, v_subtotal + v_tax_amount + v_shipping_amount,
    p_shipping_method, p_shipping_address, COALESCE(p_billing_address, p_shipping_address)
  )
  RETURNING id INTO v_order_id;
  
  -- Create order items
  INSERT INTO order_items (order_id, variant_id, product_name, variant_title, quantity, unit_price, total_price)
  SELECT 
    v_order_id,
    ci.variant_id,
    p.name,
    pv.title,
    ci.quantity,
    COALESCE(pv.price, p.base_price),
    COALESCE(pv.price, p.base_price) * ci.quantity
  FROM cart_items ci
  JOIN shopping_carts sc ON sc.id = ci.cart_id
  JOIN product_variants pv ON pv.id = ci.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE sc.user_id = p_user_id AND p.shop_id = v_shop_id;
  
  -- Reserve inventory
  UPDATE inventory 
  SET reserved_quantity = reserved_quantity + ci.quantity
  FROM cart_items ci
  JOIN shopping_carts sc ON sc.id = ci.cart_id
  JOIN product_variants pv ON pv.id = ci.variant_id
  JOIN products p ON p.id = pv.product_id
  WHERE inventory.variant_id = ci.variant_id 
    AND sc.user_id = p_user_id 
    AND p.shop_id = v_shop_id;
  
  -- Clear cart items for this shop
  DELETE FROM cart_items 
  WHERE cart_id = (SELECT id FROM shopping_carts WHERE user_id = p_user_id)
    AND variant_id IN (
      SELECT pv.id FROM product_variants pv 
      JOIN products p ON p.id = pv.product_id 
      WHERE p.shop_id = v_shop_id
    );
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Browse products with filters
CREATE OR REPLACE FUNCTION browse_products(
  p_category_id UUID DEFAULT NULL,
  p_shop_id UUID DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_condition product_condition DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at', -- 'created_at', 'price_asc', 'price_desc', 'rating', 'popularity'
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  product_id UUID,
  shop_id UUID,
  shop_name VARCHAR(255),
  product_name VARCHAR(255),
  description TEXT,
  base_price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  brand VARCHAR(255),
  condition product_condition,
  rating NUMERIC(3,2),
  total_reviews INTEGER,
  images JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_order_clause TEXT;
BEGIN
  -- Build order clause
  CASE p_sort_by
    WHEN 'price_asc' THEN v_order_clause := 'p.base_price ASC';
    WHEN 'price_desc' THEN v_order_clause := 'p.base_price DESC';
    WHEN 'rating' THEN v_order_clause := 'p.rating DESC, p.total_reviews DESC';
    WHEN 'popularity' THEN v_order_clause := 'p.total_sold DESC, p.view_count DESC';
    ELSE v_order_clause := 'p.created_at DESC';
  END CASE;

  RETURN QUERY EXECUTE format('
    SELECT 
      p.id, p.shop_id, s.name, p.name, p.description, p.base_price, 
      p.compare_at_price, p.brand, p.condition, p.rating, p.total_reviews,
      p.images, p.tags, p.created_at
    FROM products p
    JOIN shops s ON s.id = p.shop_id
    WHERE p.is_active = TRUE 
      AND s.status = ''active''
      AND ($1 IS NULL OR p.category_id = $1)
      AND ($2 IS NULL OR p.shop_id = $2)
      AND ($3 IS NULL OR p.name ILIKE ''%%'' || $3 || ''%%'' OR p.description ILIKE ''%%'' || $3 || ''%%'')
      AND ($4 IS NULL OR p.base_price >= $4)
      AND ($5 IS NULL OR p.base_price <= $5)
      AND ($6 IS NULL OR p.tags && $6)
      AND ($7 IS NULL OR p.condition = $7)
    ORDER BY %s
    LIMIT $8 OFFSET $9
  ', v_order_clause)
  USING p_category_id, p_shop_id, p_search_term, p_min_price, p_max_price, p_tags, p_condition, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add product review
CREATE OR REPLACE FUNCTION add_product_review(
  p_product_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_title VARCHAR(255) DEFAULT NULL,
  p_review_text TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
  v_is_verified BOOLEAN := FALSE;
BEGIN
  -- Check if user is banned
  IF is_user_banned(p_user_id) THEN
    RAISE EXCEPTION 'User is banned and cannot add reviews';
  END IF;

  -- Check if this is a verified purchase
  IF p_order_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN product_variants pv ON pv.id = oi.variant_id
      WHERE o.id = p_order_id 
        AND o.user_id = p_user_id 
        AND pv.product_id = p_product_id
        AND o.status = 'delivered'
    ) INTO v_is_verified;
  END IF;

  INSERT INTO product_reviews (
    product_id, user_id, order_id, rating, title, review_text, is_verified_purchase
  )
  VALUES (
    p_product_id, p_user_id, p_order_id, p_rating, p_title, p_review_text, v_is_verified
  )
  RETURNING id INTO v_review_id;
  
  -- Update product rating
  UPDATE products 
  SET rating = (
    SELECT AVG(rating)::NUMERIC(3,2) 
    FROM product_reviews 
    WHERE product_id = p_product_id
  ),
  total_reviews = (
    SELECT COUNT(*) 
    FROM product_reviews 
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;
  
  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Chats & Chatrooms: schema, indexes, and helpers
-- =============================================

-- Ensure UUID extension exists (no-op if already created)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations: supports both 1:1 (dm) and rooms
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('dm','room')),
  title TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  max_members INTEGER NOT NULL DEFAULT 100 CHECK (max_members > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members: per user per conversation
CREATE TABLE IF NOT EXISTS chat_members (
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','guest')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  last_read_message_id UUID,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages: supports replies and soft-delete
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','file','system')),
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Reactions: one user reaction per message per reaction type
CREATE TABLE IF NOT EXISTS chat_message_reactions (
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, reaction)
);

-- Read receipts: one per user per message
CREATE TABLE IF NOT EXISTS chat_read_receipts (
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Bans: moderation support for rooms
CREATE TABLE IF NOT EXISTS chat_bans (
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON chat_conversations(type);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visibility ON chat_conversations(visibility);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_conv ON chat_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created_at ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_read_receipts_user ON chat_read_receipts(user_id);

-- Touch updated_at on conversations
CREATE OR REPLACE FUNCTION touch_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'chat_conversations_updated_at'
  ) THEN
    CREATE TRIGGER chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION touch_chat_conversations_updated_at();
  END IF;
END $$;

-- =========================
-- Chat creation and actions
-- =========================

-- Create or get an existing 1:1 DM between two users
CREATE OR REPLACE FUNCTION create_dm_conversation(
  p_user_a UUID,
  p_user_b UUID,
  p_title TEXT DEFAULT NULL
) RETURNS chat_conversations AS $$
DECLARE
  v_conv_id UUID;
  v_conv chat_conversations;
BEGIN
  IF p_user_a IS NULL OR p_user_b IS NULL OR p_user_a = p_user_b THEN
    RAISE EXCEPTION 'Invalid users for DM conversation';
  END IF;

  -- Ban checks
  IF is_user_banned(p_user_a) OR is_user_banned(p_user_b) THEN
    RAISE EXCEPTION 'One or both users are banned';
  END IF;
  -- Block checks (global/messages/chat)
  IF is_user_blocked(p_user_a, p_user_b, ARRAY['global'::block_scope,'messages'::block_scope,'chat'::block_scope]) THEN
    RAISE EXCEPTION 'Users are blocked from direct messaging';
  END IF;

  -- Find existing active DM with both participants
  SELECT cm1.conversation_id INTO v_conv_id
  FROM chat_members cm1
  JOIN chat_members cm2 ON cm2.conversation_id = cm1.conversation_id
  JOIN chat_conversations c ON c.id = cm1.conversation_id
  WHERE c.type = 'dm'
    AND cm1.user_id = p_user_a AND cm1.left_at IS NULL
    AND cm2.user_id = p_user_b AND cm2.left_at IS NULL
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    SELECT * INTO v_conv FROM chat_conversations WHERE id = v_conv_id;
    RETURN v_conv;
  END IF;

  -- Create new DM conversation
  INSERT INTO chat_conversations(type, title, description, created_by)
  VALUES('dm', COALESCE(p_title, ''), NULL, p_user_a)
  RETURNING * INTO v_conv;

  -- Add members (owner is creator)
  INSERT INTO chat_members(conversation_id, user_id, role) VALUES (v_conv.id, p_user_a, 'owner');
  INSERT INTO chat_members(conversation_id, user_id, role) VALUES (v_conv.id, p_user_b, 'member');

  RETURN v_conv;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create a chatroom
CREATE OR REPLACE FUNCTION create_chatroom(
  p_created_by UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public',
  p_max_members INTEGER DEFAULT 100
) RETURNS chat_conversations AS $$
DECLARE
  v_conv chat_conversations;
BEGIN
  IF p_created_by IS NULL OR p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'created_by and title are required';
  END IF;
  IF p_visibility NOT IN ('public','private') THEN
    RAISE EXCEPTION 'visibility must be public or private';
  END IF;
  IF p_max_members IS NULL OR p_max_members <= 0 THEN
    RAISE EXCEPTION 'max_members must be > 0';
  END IF;

  INSERT INTO chat_conversations(type, title, description, created_by, visibility, max_members)
  VALUES('room', p_title, p_description, p_created_by, p_visibility, p_max_members)
  RETURNING * INTO v_conv;

  INSERT INTO chat_members(conversation_id, user_id, role) VALUES (v_conv.id, p_created_by, 'owner');

  RETURN v_conv;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Join a chatroom
CREATE OR REPLACE FUNCTION join_chatroom(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS chat_members AS $$
DECLARE
  v_member chat_members;
  v_active_count INTEGER;
  v_conv chat_conversations;
BEGIN
  IF p_conversation_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'conversation_id and user_id are required';
  END IF;

  SELECT * INTO v_conv FROM chat_conversations WHERE id = p_conversation_id;
  IF NOT FOUND OR v_conv.type <> 'room' THEN
    RAISE EXCEPTION 'conversation not found or not a room';
  END IF;
  IF v_conv.is_active = FALSE THEN
    RAISE EXCEPTION 'conversation is inactive';
  END IF;

  -- Check ban
  IF EXISTS (
    SELECT 1 FROM chat_bans b
    WHERE b.conversation_id = p_conversation_id AND b.user_id = p_user_id
      AND (b.expires_at IS NULL OR b.expires_at > NOW())
  ) THEN
    RAISE EXCEPTION 'user is banned from this room';
  END IF;

  -- Check capacity
  SELECT COUNT(*) INTO v_active_count
  FROM chat_members
  WHERE conversation_id = p_conversation_id AND left_at IS NULL;
  IF v_active_count >= v_conv.max_members THEN
    RAISE EXCEPTION 'room is full';
  END IF;

  -- If already a member and left previously, rejoin
  UPDATE chat_members
  SET left_at = NULL, joined_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  RETURNING * INTO v_member;

  IF FOUND THEN
    RETURN v_member;
  END IF;

  INSERT INTO chat_members(conversation_id, user_id, role)
  VALUES (p_conversation_id, p_user_id, 'member')
  RETURNING * INTO v_member;
  RETURN v_member;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Leave a chat (DM or room)
CREATE OR REPLACE FUNCTION leave_chat(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS chat_members AS $$
DECLARE
  v_member chat_members;
BEGIN
  UPDATE chat_members
  SET left_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id AND left_at IS NULL
  RETURNING * INTO v_member;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user is not an active member of this conversation';
  END IF;
  RETURN v_member;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Send a message (ensures membership and not banned)
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_body TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_reply_to_id UUID DEFAULT NULL
) RETURNS chat_messages AS $$
DECLARE
  v_msg chat_messages;
  v_conv chat_conversations;
  v_other UUID;
  v_prob RECORD;
  v_msg_count INTEGER;
BEGIN
  IF p_conversation_id IS NULL OR p_sender_id IS NULL THEN
    RAISE EXCEPTION 'conversation_id and sender_id are required';
  END IF;
  IF p_body IS NULL OR TRIM(p_body) = '' THEN
    RAISE EXCEPTION 'message body is required';
  END IF;

  -- Must be active member
  IF NOT EXISTS (
    SELECT 1 FROM chat_members
    WHERE conversation_id = p_conversation_id AND user_id = p_sender_id AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'sender is not a member of this conversation';
  END IF;

  -- Not banned
  IF EXISTS (
    SELECT 1 FROM chat_bans b
    WHERE b.conversation_id = p_conversation_id AND b.user_id = p_sender_id
      AND (b.expires_at IS NULL OR b.expires_at > NOW())
  ) THEN
    RAISE EXCEPTION 'sender is banned from this conversation';
  END IF;

  -- Global/user bans
  IF is_user_banned(p_sender_id) THEN
    RAISE EXCEPTION 'sender is banned';
  END IF;

  -- Block checks for DMs
  SELECT * INTO v_conv FROM chat_conversations WHERE id = p_conversation_id;
  IF v_conv.type = 'dm' THEN
    SELECT user_id INTO v_other FROM chat_members WHERE conversation_id = p_conversation_id AND user_id <> p_sender_id AND left_at IS NULL LIMIT 1;
    IF v_other IS NOT NULL AND is_user_blocked(p_sender_id, v_other, ARRAY['global'::block_scope,'messages'::block_scope,'chat'::block_scope]) THEN
      RAISE EXCEPTION 'message blocked due to user block';
    END IF;
  END IF;

  -- Probation rate limit
  SELECT * INTO v_prob FROM get_active_probation(p_sender_id);
  IF v_prob IS NOT NULL AND v_prob.message_rate_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_msg_count FROM chat_messages WHERE sender_id = p_sender_id AND created_at > NOW() - INTERVAL '1 minute';
    IF v_msg_count >= v_prob.message_rate_limit THEN
      RAISE EXCEPTION 'message rate limited due to probation';
    END IF;
  END IF;

  INSERT INTO chat_messages(conversation_id, sender_id, body, message_type, reply_to_id)
  VALUES (p_conversation_id, p_sender_id, p_body, p_message_type, p_reply_to_id)
  RETURNING * INTO v_msg;

  -- Mark sender read on their own message
  INSERT INTO chat_read_receipts(message_id, user_id, read_at)
  VALUES (v_msg.id, p_sender_id, NOW())
  ON CONFLICT DO NOTHING;

  RETURN v_msg;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Mark a specific message as read by user
CREATE OR REPLACE FUNCTION mark_message_read(
  p_message_id UUID,
  p_user_id UUID
) RETURNS chat_read_receipts AS $$
DECLARE
  v_receipt chat_read_receipts;
BEGIN
  INSERT INTO chat_read_receipts(message_id, user_id, read_at)
  VALUES (p_message_id, p_user_id, NOW())
  ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = EXCLUDED.read_at
  RETURNING * INTO v_receipt;
  RETURN v_receipt;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =========================
-- Inbox and retrieval helpers
-- =========================

-- Get a user's inbox: conversations with last message and unread count
CREATE OR REPLACE FUNCTION get_user_inbox(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  conversation_id UUID,
  type TEXT,
  title TEXT,
  visibility TEXT,
  is_active BOOLEAN,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INTEGER,
  is_muted BOOLEAN,
  is_pinned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH last_read AS (
    SELECT cm.conversation_id, cm.user_id, MAX(rr.read_at) AS read_at
    FROM chat_members cm
    LEFT JOIN chat_read_receipts rr ON rr.user_id = cm.user_id AND rr.message_id IN (
      SELECT id FROM chat_messages WHERE conversation_id = cm.conversation_id
    )
    WHERE cm.user_id = p_user_id AND cm.left_at IS NULL
    GROUP BY cm.conversation_id, cm.user_id
  ), latest_msg AS (
    SELECT m.conversation_id,
           MAX(m.created_at) AS last_message_at,
           (ARRAY_AGG(m.body ORDER BY m.created_at DESC))[1] AS last_message_preview
    FROM chat_messages m
    WHERE m.deleted_at IS NULL
    GROUP BY m.conversation_id
  ), unread AS (
    SELECT m.conversation_id,
           COUNT(*) AS unread_count
    FROM chat_messages m
    JOIN chat_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = p_user_id AND cm.left_at IS NULL
    LEFT JOIN last_read lr ON lr.conversation_id = m.conversation_id AND lr.user_id = p_user_id
    WHERE m.deleted_at IS NULL AND (lr.read_at IS NULL OR m.created_at > lr.read_at)
    GROUP BY m.conversation_id
  )
  SELECT c.id AS conversation_id, c.type, c.title, c.visibility, c.is_active,
         lm.last_message_at, lm.last_message_preview,
         COALESCE(u.unread_count, 0) AS unread_count,
         cm.is_muted, cm.is_pinned
  FROM chat_conversations c
  JOIN chat_members cm ON cm.conversation_id = c.id AND cm.user_id = p_user_id AND cm.left_at IS NULL
  LEFT JOIN latest_msg lm ON lm.conversation_id = c.id
  LEFT JOIN unread u ON u.conversation_id = c.id
  ORDER BY COALESCE(lm.last_message_at, c.created_at) DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- User Blocking, Bans, and Probation
-- =============================================

-- Enums for blocking scopes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'block_scope') THEN
    CREATE TYPE block_scope AS ENUM ('global','messages','chat','meeting','proposal');
  END IF;
END $$;

-- User-to-user blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scope block_scope NOT NULL DEFAULT 'global',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  UNIQUE (blocker_id, blocked_id, scope)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_scope ON user_blocks(scope);

CREATE OR REPLACE FUNCTION touch_user_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_blocks_updated_at'
  ) THEN
    CREATE TRIGGER user_blocks_updated_at
    BEFORE UPDATE ON user_blocks
    FOR EACH ROW
    EXECUTE FUNCTION touch_user_blocks_updated_at();
  END IF;
END $$;

-- Block management functions
CREATE OR REPLACE FUNCTION block_user(
  p_blocker_id UUID,
  p_blocked_id UUID,
  p_scope block_scope DEFAULT 'global',
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS user_blocks AS $$
DECLARE
  v_block user_blocks;
BEGIN
  IF p_blocker_id IS NULL OR p_blocked_id IS NULL OR p_blocker_id = p_blocked_id THEN
    RAISE EXCEPTION 'Invalid blocker/blocked ids';
  END IF;
  INSERT INTO user_blocks(blocker_id, blocked_id, scope, reason, expires_at)
  VALUES(p_blocker_id, p_blocked_id, p_scope, p_reason, p_expires_at)
  ON CONFLICT (blocker_id, blocked_id, scope) DO UPDATE SET
    reason = EXCLUDED.reason,
    expires_at = EXCLUDED.expires_at,
    revoked_at = NULL,
    updated_at = NOW()
  RETURNING * INTO v_block;
  RETURN v_block;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION unblock_user(
  p_blocker_id UUID,
  p_blocked_id UUID,
  p_scope block_scope DEFAULT 'global'
) RETURNS user_blocks AS $$
DECLARE
  v_block user_blocks;
BEGIN
  UPDATE user_blocks
  SET revoked_at = NOW(), updated_at = NOW()
  WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id AND scope = p_scope AND revoked_at IS NULL
  RETURNING * INTO v_block;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active block found';
  END IF;
  RETURN v_block;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Check helper: either direction and global scope applies
CREATE OR REPLACE FUNCTION is_user_blocked(
  p_user_a UUID,
  p_user_b UUID,
  p_scopes block_scope[]
) RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_blocks b
    WHERE b.revoked_at IS NULL
      AND (b.expires_at IS NULL OR b.expires_at > NOW())
      AND ((b.blocker_id = p_user_a AND b.blocked_id = p_user_b) OR (b.blocker_id = p_user_b AND b.blocked_id = p_user_a))
      AND (b.scope = ANY(p_scopes) OR b.scope = 'global')
  );
$$ LANGUAGE sql STABLE;

-- System-wide bans
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id);

CREATE OR REPLACE FUNCTION touch_user_bans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_bans_updated_at'
  ) THEN
    CREATE TRIGGER user_bans_updated_at
    BEFORE UPDATE ON user_bans
    FOR EACH ROW
    EXECUTE FUNCTION touch_user_bans_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION ban_user(
  p_user_id UUID,
  p_banned_by UUID,
  p_reason TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS user_bans AS $$
DECLARE
  v_ban user_bans;
BEGIN
  INSERT INTO user_bans(user_id, banned_by, reason, notes, expires_at)
  VALUES(p_user_id, p_banned_by, p_reason, p_notes, p_expires_at)
  RETURNING * INTO v_ban;
  RETURN v_ban;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION unban_user(
  p_user_id UUID,
  p_banned_by UUID DEFAULT NULL
) RETURNS user_bans AS $$
DECLARE
  v_ban user_bans;
BEGIN
  UPDATE user_bans ub
  SET revoked_at = NOW(), updated_at = NOW()
  WHERE ub.id = (
    SELECT id FROM user_bans
    WHERE user_id = p_user_id AND revoked_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  )
  RETURNING * INTO v_ban;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active ban found for user';
  END IF;
  RETURN v_ban;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_bans b
    WHERE b.user_id = p_user_id AND b.revoked_at IS NULL AND (b.expires_at IS NULL OR b.expires_at > NOW())
  );
$$ LANGUAGE sql STABLE;

-- Probation settings
CREATE TABLE IF NOT EXISTS user_probations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  probation_until TIMESTAMPTZ,
  message_rate_limit INTEGER CHECK (message_rate_limit IS NULL OR message_rate_limit >= 0),
  max_conversations INTEGER CHECK (max_conversations IS NULL OR max_conversations >= 0),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_probations_user ON user_probations(user_id);

CREATE OR REPLACE FUNCTION touch_user_probations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_probations_updated_at'
  ) THEN
    CREATE TRIGGER user_probations_updated_at
    BEFORE UPDATE ON user_probations
    FOR EACH ROW
    EXECUTE FUNCTION touch_user_probations_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_user_probation(
  p_user_id UUID,
  p_set_by UUID,
  p_reason TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_probation_until TIMESTAMPTZ DEFAULT NULL,
  p_message_rate_limit INTEGER DEFAULT NULL,
  p_max_conversations INTEGER DEFAULT NULL
) RETURNS user_probations AS $$
DECLARE
  v_prob user_probations;
BEGIN
  INSERT INTO user_probations(user_id, set_by, reason, notes, probation_until, message_rate_limit, max_conversations)
  VALUES(p_user_id, p_set_by, p_reason, p_notes, p_probation_until, p_message_rate_limit, p_max_conversations)
  RETURNING * INTO v_prob;
  RETURN v_prob;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION revoke_user_probation(p_user_id UUID)
RETURNS user_probations AS $$
DECLARE
  v_prob user_probations;
BEGIN
  UPDATE user_probations up
  SET revoked_at = NOW(), updated_at = NOW()
  WHERE up.id = (
    SELECT id FROM user_probations
    WHERE user_id = p_user_id AND revoked_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  )
  RETURNING * INTO v_prob;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active probation found for user';
  END IF;
  RETURN v_prob;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION get_active_probation(p_user_id UUID)
RETURNS user_probations AS $$
  SELECT * FROM user_probations
  WHERE user_id = p_user_id AND revoked_at IS NULL AND (probation_until IS NULL OR probation_until > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get messages in a conversation
CREATE OR REPLACE FUNCTION get_messages(
  p_conversation_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS SETOF chat_messages AS $$
  SELECT *
  FROM chat_messages
  WHERE conversation_id = p_conversation_id AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset
$$ LANGUAGE sql STABLE;

-- =============================================
-- Guardianship, Meetings, and Proposals
-- =============================================

-- Enums (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'guardian_role') THEN
    CREATE TYPE guardian_role AS ENUM ('wali','parent','imam','chaperone');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_status') THEN
    CREATE TYPE consent_status AS ENUM ('pending','approved','rejected','revoked');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_status') THEN
    CREATE TYPE meeting_status AS ENUM ('requested','accepted','declined','scheduled','completed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
    CREATE TYPE proposal_status AS ENUM ('pending','accepted','rejected','withdrawn','returned','cancelled');
  END IF;
END $$;

-- Guardianship link between a user and their guardian
CREATE TABLE IF NOT EXISTS user_guardian_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role guardian_role NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, guardian_id, role)
);

CREATE INDEX IF NOT EXISTS idx_guardian_user ON user_guardian_links(user_id);
CREATE INDEX IF NOT EXISTS idx_guardian_guardian ON user_guardian_links(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_status ON user_guardian_links(status);

-- Touch updated_at on guardian links
CREATE OR REPLACE FUNCTION touch_guardian_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_guardian_links_updated_at'
  ) THEN
    CREATE TRIGGER user_guardian_links_updated_at
    BEFORE UPDATE ON user_guardian_links
    FOR EACH ROW
    EXECUTE FUNCTION touch_guardian_links_updated_at();
  END IF;
END $$;

-- Consent flow functions
CREATE OR REPLACE FUNCTION request_guardian_consent(
  p_user_id UUID,
  p_guardian_id UUID,
  p_role guardian_role,
  p_invited_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS user_guardian_links AS $$
DECLARE
  v_link user_guardian_links;
BEGIN
  IF p_user_id IS NULL OR p_guardian_id IS NULL OR p_role IS NULL THEN
    RAISE EXCEPTION 'user_id, guardian_id, and role are required';
  END IF;

  INSERT INTO user_guardian_links(user_id, guardian_id, role, status, invited_by, invited_at, notes)
  VALUES(p_user_id, p_guardian_id, p_role, 'pending', p_invited_by, NOW(), p_notes)
  ON CONFLICT (user_id, guardian_id, role) DO UPDATE SET
    status = 'pending', invited_by = EXCLUDED.invited_by, invited_at = NOW(), notes = EXCLUDED.notes, updated_at = NOW()
  RETURNING * INTO v_link;
  RETURN v_link;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION respond_guardian_consent(
  p_link_id UUID,
  p_responder_id UUID,
  p_approve BOOLEAN,
  p_notes TEXT DEFAULT NULL
) RETURNS user_guardian_links AS $$
DECLARE
  v_link user_guardian_links;
BEGIN
  UPDATE user_guardian_links
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      responded_at = NOW(),
      notes = COALESCE(p_notes, notes),
      updated_at = NOW()
  WHERE id = p_link_id AND guardian_id = p_responder_id
  RETURNING * INTO v_link;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Consent link not found or responder not guardian';
  END IF;
  RETURN v_link;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Meeting requests
CREATE TABLE IF NOT EXISTS meeting_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chaperone_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  etiquette_prompt TEXT DEFAULT 'Please observe adab: no flirtation, be respectful, maintain boundaries, and consider a chaperone.',
  location TEXT,
  scheduled_time TIMESTAMPTZ,
  status meeting_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_requester ON meeting_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_invitee ON meeting_requests(invitee_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_chaperone ON meeting_requests(chaperone_id);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_status ON meeting_requests(status);

CREATE OR REPLACE FUNCTION touch_meeting_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'meeting_requests_updated_at'
  ) THEN
    CREATE TRIGGER meeting_requests_updated_at
    BEFORE UPDATE ON meeting_requests
    FOR EACH ROW
    EXECUTE FUNCTION touch_meeting_requests_updated_at();
  END IF;
END $$;

-- Meeting functions
CREATE OR REPLACE FUNCTION request_meeting(
  p_requester_id UUID,
  p_invitee_id UUID,
  p_title TEXT,
  p_notes TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_scheduled_time TIMESTAMPTZ DEFAULT NULL,
  p_etiquette_prompt TEXT DEFAULT NULL
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  IF p_requester_id IS NULL OR p_invitee_id IS NULL OR p_title IS NULL OR TRIM(p_title) = '' THEN
    RAISE EXCEPTION 'requester_id, invitee_id, and title are required';
  END IF;
  IF is_user_banned(p_requester_id) THEN
    RAISE EXCEPTION 'requester is banned';
  END IF;
  IF is_user_blocked(p_requester_id, p_invitee_id, ARRAY['global'::block_scope,'meeting'::block_scope]) THEN
    RAISE EXCEPTION 'meeting request blocked between users';
  END IF;
  INSERT INTO meeting_requests(requester_id, invitee_id, title, notes, location, scheduled_time, etiquette_prompt)
  VALUES(p_requester_id, p_invitee_id, p_title, p_notes, p_location, p_scheduled_time, COALESCE(p_etiquette_prompt, 'Please observe adab: no flirtation, be respectful, maintain boundaries, and consider a chaperone.'))
  RETURNING * INTO v_meet;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION accept_meeting(
  p_meeting_id UUID,
  p_user_id UUID
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  UPDATE meeting_requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_meeting_id AND invitee_id = p_user_id AND status = 'requested'
  RETURNING * INTO v_meet;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meeting not found or already processed';
  END IF;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION decline_meeting(
  p_meeting_id UUID,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  UPDATE meeting_requests
  SET status = 'declined', notes = COALESCE(p_notes, notes), updated_at = NOW()
  WHERE id = p_meeting_id AND invitee_id = p_user_id AND status IN ('requested','accepted')
  RETURNING * INTO v_meet;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meeting not found or cannot be declined';
  END IF;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION assign_chaperone(
  p_meeting_id UUID,
  p_chaperone_id UUID
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  UPDATE meeting_requests
  SET chaperone_id = p_chaperone_id, updated_at = NOW()
  WHERE id = p_meeting_id
  RETURNING * INTO v_meet;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meeting not found';
  END IF;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION schedule_meeting(
  p_meeting_id UUID,
  p_scheduled_time TIMESTAMPTZ
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  UPDATE meeting_requests
  SET scheduled_time = p_scheduled_time, status = 'scheduled', updated_at = NOW()
  WHERE id = p_meeting_id
  RETURNING * INTO v_meet;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meeting not found';
  END IF;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION cancel_meeting(
  p_meeting_id UUID,
  p_cancelled_by UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS meeting_requests AS $$
DECLARE
  v_meet meeting_requests;
BEGIN
  UPDATE meeting_requests
  SET status = 'cancelled', notes = COALESCE(p_notes, notes), updated_at = NOW()
  WHERE id = p_meeting_id AND (requester_id = p_cancelled_by OR invitee_id = p_cancelled_by)
  RETURNING * INTO v_meet;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meeting not found or user not authorized to cancel';
  END IF;
  RETURN v_meet;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Marriage proposals
CREATE TABLE IF NOT EXISTS marriage_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suitor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bride_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mahr_xft_id BIGINT,
  notes TEXT,
  status proposal_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_suitor ON marriage_proposals(suitor_id);
CREATE INDEX IF NOT EXISTS idx_proposals_bride ON marriage_proposals(bride_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON marriage_proposals(status);

CREATE OR REPLACE FUNCTION touch_marriage_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'marriage_proposals_updated_at'
  ) THEN
    CREATE TRIGGER marriage_proposals_updated_at
    BEFORE UPDATE ON marriage_proposals
    FOR EACH ROW
    EXECUTE FUNCTION touch_marriage_proposals_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION create_marriage_proposal(
  p_suitor_id UUID,
  p_bride_id UUID,
  p_mahr_xft_id BIGINT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS marriage_proposals AS $$
DECLARE
  v_prop marriage_proposals;
BEGIN
  IF p_suitor_id IS NULL OR p_bride_id IS NULL OR p_suitor_id = p_bride_id THEN
    RAISE EXCEPTION 'Invalid suitor/bride for proposal';
  END IF;
  IF is_user_banned(p_suitor_id) THEN
    RAISE EXCEPTION 'suitor is banned';
  END IF;
  IF is_user_blocked(p_suitor_id, p_bride_id, ARRAY['global'::block_scope,'proposal'::block_scope]) THEN
    RAISE EXCEPTION 'proposal blocked between users';
  END IF;
  INSERT INTO marriage_proposals(suitor_id, bride_id, mahr_xft_id, notes)
  VALUES(p_suitor_id, p_bride_id, p_mahr_xft_id, p_notes)
  RETURNING * INTO v_prop;
  RETURN v_prop;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION respond_marriage_proposal(
  p_proposal_id UUID,
  p_responder_id UUID,
  p_action TEXT
) RETURNS marriage_proposals AS $$
DECLARE
  v_prop marriage_proposals;
BEGIN
  IF p_action NOT IN ('accept','reject','withdraw','cancel') THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;
  UPDATE marriage_proposals
  SET status = CASE
      WHEN p_action = 'accept' AND p_responder_id = bride_id THEN 'accepted'
      WHEN p_action = 'reject' AND p_responder_id = bride_id THEN 'rejected'
      WHEN p_action = 'withdraw' AND p_responder_id = suitor_id THEN 'withdrawn'
      WHEN p_action = 'cancel' THEN 'cancelled'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_proposal_id
  RETURNING * INTO v_prop;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  -- Validate role-specific actions
  IF (p_action = 'accept' OR p_action = 'reject') AND v_prop.bride_id <> p_responder_id THEN
    RAISE EXCEPTION 'Only bride can accept/reject the proposal';
  END IF;
  IF p_action = 'withdraw' AND v_prop.suitor_id <> p_responder_id THEN
    RAISE EXCEPTION 'Only suitor can withdraw the proposal';
  END IF;
  RETURN v_prop;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =========================
-- Unified Inbox: conversations + meetings + proposals
-- =========================

CREATE OR REPLACE FUNCTION get_user_inbox_unified(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  item_type TEXT,           -- 'conversation' | 'meeting' | 'proposal'
  item_id TEXT,             -- UUID or BIGINT as text
  title TEXT,
  last_activity_at TIMESTAMPTZ,
  preview TEXT,
  unread_count INTEGER,
  is_muted BOOLEAN,
  is_pinned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH chat AS (
    SELECT 
      'conversation'::TEXT AS item_type,
      c.id::TEXT AS item_id,
      c.title,
      COALESCE(lm.last_message_at, c.created_at) AS last_activity_at,
      lm.last_message_preview AS preview,
      COALESCE(u.unread_count, 0) AS unread_count,
      cm.is_muted,
      cm.is_pinned
    FROM chat_conversations c
    JOIN chat_members cm ON cm.conversation_id = c.id AND cm.user_id = p_user_id AND cm.left_at IS NULL
    LEFT JOIN (
      SELECT m.conversation_id,
             MAX(m.created_at) AS last_message_at,
             (ARRAY_AGG(m.body ORDER BY m.created_at DESC))[1] AS last_message_preview
      FROM chat_messages m
      WHERE m.deleted_at IS NULL
      GROUP BY m.conversation_id
    ) lm ON lm.conversation_id = c.id
    LEFT JOIN (
      SELECT m.conversation_id,
             COUNT(*) AS unread_count
      FROM chat_messages m
      JOIN chat_members cm2 ON cm2.conversation_id = m.conversation_id AND cm2.user_id = p_user_id AND cm2.left_at IS NULL
      LEFT JOIN (
        SELECT cm3.conversation_id, MAX(rr.read_at) AS read_at
        FROM chat_members cm3
        LEFT JOIN chat_read_receipts rr ON rr.user_id = p_user_id AND rr.message_id IN (
          SELECT id FROM chat_messages WHERE conversation_id = cm3.conversation_id
        )
        WHERE cm3.user_id = p_user_id AND cm3.left_at IS NULL
        GROUP BY cm3.conversation_id
      ) lr ON lr.conversation_id = m.conversation_id
      WHERE m.deleted_at IS NULL AND (lr.read_at IS NULL OR m.created_at > lr.read_at)
      GROUP BY m.conversation_id
    ) u ON u.conversation_id = c.id
  ), meetings AS (
    SELECT 
      'meeting'::TEXT AS item_type,
      mr.id::TEXT AS item_id,
      mr.title,
      mr.updated_at AS last_activity_at,
      CONCAT('Meeting ', mr.status::TEXT, COALESCE(' • ' || mr.location, '')) AS preview,
      0 AS unread_count,
      NULL::BOOLEAN AS is_muted,
      NULL::BOOLEAN AS is_pinned
    FROM meeting_requests mr
    WHERE mr.requester_id = p_user_id OR mr.invitee_id = p_user_id OR mr.chaperone_id = p_user_id
  ), proposals AS (
    SELECT 
      'proposal'::TEXT AS item_type,
      mp.id::TEXT AS item_id,
      CONCAT('Proposal from ', (SELECT COALESCE(u1.full_name, u1.first_name) FROM users u1 WHERE u1.id = mp.suitor_id)) AS title,
      mp.updated_at AS last_activity_at,
      CONCAT('Status: ', mp.status::TEXT, COALESCE(' • Mahr XFT: ' || mp.mahr_xft_id::TEXT, '')) AS preview,
      0 AS unread_count,
      NULL::BOOLEAN AS is_muted,
      NULL::BOOLEAN AS is_pinned
    FROM marriage_proposals mp
    WHERE mp.suitor_id = p_user_id OR mp.bride_id = p_user_id
  )
  SELECT * FROM chat
  UNION ALL
  SELECT * FROM meetings
  UNION ALL
  SELECT * FROM proposals
  ORDER BY last_activity_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;


-- Search by common match filters (gender, age, interests, ratings)
CREATE OR REPLACE FUNCTION search_users_by_filters(
  p_gender gender_type DEFAULT NULL,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_min_bio_rating INTEGER DEFAULT NULL,
  p_min_pictures_rating INTEGER DEFAULT NULL,
  p_min_response_rate NUMERIC DEFAULT NULL,
  p_min_communication_rating INTEGER DEFAULT NULL
) RETURNS SETOF user_profile_view AS $$
  SELECT v.*
  FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE (p_gender IS NULL OR u.gender = p_gender::text)
    AND (p_age_min IS NULL OR u.age >= p_age_min)
    AND (p_age_max IS NULL OR u.age <= p_age_max)
    AND (p_interests IS NULL OR u.interests && p_interests)
    AND (p_min_bio_rating IS NULL OR u.bio_rating >= p_min_bio_rating)
    AND (p_min_pictures_rating IS NULL OR u.pictures_rating >= p_min_pictures_rating)
    AND (p_min_response_rate IS NULL OR u.response_rate >= p_min_response_rate)
    AND (p_min_communication_rating IS NULL OR u.communication_rating >= p_min_communication_rating)
$$ LANGUAGE sql STABLE;

-- Helper: Men searching for women and vice versa
CREATE OR REPLACE FUNCTION search_opposite_gender(
  p_requester_gender gender_type,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL
) RETURNS SETOF user_profile_view AS $$
  SELECT v.*
  FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE (p_requester_gender = 'male' AND u.gender = 'female')
     OR (p_requester_gender = 'female' AND u.gender = 'male')
    AND (p_age_min IS NULL OR u.age >= p_age_min)
    AND (p_age_max IS NULL OR u.age <= p_age_max)
$$ LANGUAGE sql STABLE;

-- Unified search: combines location radius, filters, sorting, and pagination
CREATE OR REPLACE FUNCTION search_users(
  center_lat DOUBLE PRECISION DEFAULT NULL,
  center_lon DOUBLE PRECISION DEFAULT NULL,
  radius_miles INTEGER DEFAULT NULL,
  p_gender gender_type DEFAULT NULL,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_min_bio_rating INTEGER DEFAULT NULL,
  p_min_pictures_rating INTEGER DEFAULT NULL,
  p_min_response_rate NUMERIC DEFAULT NULL,
  p_min_communication_rating INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'distance', -- distance | bio_rating | pictures_rating | response_rate | communication_rating | created_at
  sort_dir TEXT DEFAULT 'desc',    -- asc | desc
  limit_rows INTEGER DEFAULT 50,
  offset_rows INTEGER DEFAULT 0
) RETURNS SETOF user_profile_view AS $$
  SELECT v.*
  FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE (p_gender IS NULL OR u.gender = p_gender::text)
    AND (p_age_min IS NULL OR u.age >= p_age_min)
    AND (p_age_max IS NULL OR u.age <= p_age_max)
    AND (p_interests IS NULL OR u.interests && p_interests)
    AND (p_min_bio_rating IS NULL OR u.bio_rating >= p_min_bio_rating)
    AND (p_min_pictures_rating IS NULL OR u.pictures_rating >= p_min_pictures_rating)
    AND (p_min_response_rate IS NULL OR u.response_rate >= p_min_response_rate)
    AND (p_min_communication_rating IS NULL OR u.communication_rating >= p_min_communication_rating)
    AND (
      radius_miles IS NULL OR center_lat IS NULL OR center_lon IS NULL OR u.location_point IS NULL OR
      ST_DWithin(
        u.location_point,
        ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
        radius_miles * 1609.34
      )
    )
  ORDER BY
    -- Distance ASC/DESC when center provided
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'distance' AND center_lat IS NOT NULL AND center_lon IS NOT NULL AND u.location_point IS NOT NULL
      THEN ST_Distance(u.location_point, ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography)
    END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'distance' AND center_lat IS NOT NULL AND center_lon IS NOT NULL AND u.location_point IS NOT NULL
      THEN ST_Distance(u.location_point, ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography)
    END DESC NULLS LAST,
    -- Ratings ASC/DESC
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'bio_rating' THEN u.bio_rating END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'bio_rating' THEN u.bio_rating END DESC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'pictures_rating' THEN u.pictures_rating END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'pictures_rating' THEN u.pictures_rating END DESC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'response_rate' THEN u.response_rate END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'response_rate' THEN u.response_rate END DESC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'communication_rating' THEN u.communication_rating END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'communication_rating' THEN u.communication_rating END DESC NULLS LAST,
    -- Fallback sort by created_at
    CASE WHEN LOWER(sort_dir) = 'asc' AND LOWER(sort_by) = 'created_at' THEN u.created_at END ASC NULLS LAST,
    CASE WHEN LOWER(sort_dir) = 'desc' AND LOWER(sort_by) = 'created_at' THEN u.created_at END DESC NULLS LAST
  LIMIT limit_rows OFFSET offset_rows
$$ LANGUAGE sql STABLE;

-- =============================================
-- Mahr integration: storage, views, and helpers
-- =============================================

-- Table: stores latest on-chain state per XFT mahr
CREATE TABLE IF NOT EXISTS mahr_records (
  xft_id BIGINT PRIMARY KEY,
  xft_contract TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1 CHECK (amount >= 0),
  vault TEXT,
  suitor_principal TEXT,
  bride_principal TEXT,
  suitor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bride_id UUID REFERENCES users(id) ON DELETE SET NULL,
  deposited_at TIMESTAMPTZ,
  unlock_date TIMESTAMPTZ,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  transferred BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
  returned BOOLEAN NOT NULL DEFAULT FALSE,
  rejected BOOLEAN NOT NULL DEFAULT FALSE,
  last_event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mahr_suitor_id ON mahr_records(suitor_id);
CREATE INDEX IF NOT EXISTS idx_mahr_bride_id ON mahr_records(bride_id);
CREATE INDEX IF NOT EXISTS idx_mahr_suitor_principal ON mahr_records(suitor_principal);
CREATE INDEX IF NOT EXISTS idx_mahr_bride_principal ON mahr_records(bride_principal);
CREATE INDEX IF NOT EXISTS idx_mahr_contract ON mahr_records(xft_contract);

-- Trigger to touch updated_at on change
CREATE OR REPLACE FUNCTION touch_mahr_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'mahr_records_updated_at'
  ) THEN
    CREATE TRIGGER mahr_records_updated_at
    BEFORE UPDATE ON mahr_records
    FOR EACH ROW
    EXECUTE FUNCTION touch_mahr_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'marriage_proposals' AND c.conname = 'fk_marriage_mahr'
  ) THEN
    ALTER TABLE marriage_proposals
      ADD CONSTRAINT fk_marriage_mahr
      FOREIGN KEY (mahr_xft_id) REFERENCES mahr_records(xft_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Helper: resolve suitor/bride by gender when only two users are known
-- If one is male and one is female: male -> suitor, female -> bride
-- Otherwise fall back to the first as suitor
CREATE OR REPLACE FUNCTION resolve_mahr_parties(
  p_user_a UUID,
  p_user_b UUID
) RETURNS TABLE (suitor_id UUID, bride_id UUID) AS $$
  WITH g AS (
    SELECT ua.id AS a_id, ua.gender AS a_gender, ub.id AS b_id, ub.gender AS b_gender
    FROM users ua
    JOIN users ub ON ub.id = p_user_b
    WHERE ua.id = p_user_a
  )
  SELECT
    CASE WHEN g.a_gender = 'male' AND g.b_gender = 'female' THEN g.a_id
         WHEN g.a_gender = 'female' AND g.b_gender = 'male' THEN g.b_id
         ELSE g.a_id
    END AS suitor_id,
    CASE WHEN g.a_gender = 'male' AND g.b_gender = 'female' THEN g.b_id
         WHEN g.a_gender = 'female' AND g.b_gender = 'male' THEN g.a_id
         ELSE g.b_id
    END AS bride_id
  FROM g;
$$ LANGUAGE sql STABLE;

-- Upsert from chain/indexer: accepts principals and optional user_ids
CREATE OR REPLACE FUNCTION upsert_mahr_record(
  p_xft_id BIGINT,
  p_xft_contract TEXT,
  p_amount INTEGER,
  p_vault TEXT,
  p_suitor_principal TEXT,
  p_bride_principal TEXT,
  p_suitor_id UUID DEFAULT NULL,
  p_bride_id UUID DEFAULT NULL,
  p_deposited_at TIMESTAMPTZ DEFAULT NULL,
  p_unlock_date TIMESTAMPTZ DEFAULT NULL,
  p_accepted BOOLEAN DEFAULT NULL,
  p_transferred BOOLEAN DEFAULT NULL,
  p_withdrawn BOOLEAN DEFAULT NULL,
  p_returned BOOLEAN DEFAULT NULL,
  p_rejected BOOLEAN DEFAULT NULL,
  p_last_event TEXT DEFAULT NULL
) RETURNS mahr_records AS $$
DECLARE
  v_suitor_id UUID := p_suitor_id;
  v_bride_id UUID := p_bride_id;
BEGIN
  -- Resolve user_ids by principal if not provided
  IF v_suitor_id IS NULL AND p_suitor_principal IS NOT NULL THEN
    SELECT id INTO v_suitor_id FROM users WHERE principal = p_suitor_principal LIMIT 1;
  END IF;
  IF v_bride_id IS NULL AND p_bride_principal IS NOT NULL THEN
    SELECT id INTO v_bride_id FROM users WHERE principal = p_bride_principal LIMIT 1;
  END IF;

  -- If either id is missing but both users exist, try resolving by gender
  IF v_suitor_id IS NULL AND v_bride_id IS NULL AND p_suitor_principal IS NOT NULL AND p_bride_principal IS NOT NULL THEN
    PERFORM 1; -- no-op placeholder
    -- Attempt to find user ids by principal
    SELECT id INTO v_suitor_id FROM users WHERE principal = p_suitor_principal LIMIT 1;
    SELECT id INTO v_bride_id FROM users WHERE principal = p_bride_principal LIMIT 1;
    IF v_suitor_id IS NOT NULL AND v_bride_id IS NOT NULL THEN
      SELECT suitor_id, bride_id INTO v_suitor_id, v_bride_id FROM resolve_mahr_parties(v_suitor_id, v_bride_id);
    END IF;
  ELSIF v_suitor_id IS NOT NULL AND v_bride_id IS NOT NULL THEN
    SELECT suitor_id, bride_id INTO v_suitor_id, v_bride_id FROM resolve_mahr_parties(v_suitor_id, v_bride_id);
  END IF;

  INSERT INTO mahr_records AS m (
    xft_id, xft_contract, amount, vault,
    suitor_principal, bride_principal,
    suitor_id, bride_id,
    deposited_at, unlock_date,
    accepted, transferred, withdrawn, returned, rejected,
    last_event, created_at, updated_at
  ) VALUES (
    p_xft_id, p_xft_contract, COALESCE(p_amount, 1), p_vault,
    p_suitor_principal, p_bride_principal,
    v_suitor_id, v_bride_id,
    p_deposited_at, p_unlock_date,
    COALESCE(p_accepted, FALSE), COALESCE(p_transferred, FALSE), COALESCE(p_withdrawn, FALSE), COALESCE(p_returned, FALSE), COALESCE(p_rejected, FALSE),
    p_last_event, NOW(), NOW()
  )
  ON CONFLICT (xft_id) DO UPDATE SET
    xft_contract = EXCLUDED.xft_contract,
    amount = EXCLUDED.amount,
    vault = EXCLUDED.vault,
    suitor_principal = EXCLUDED.suitor_principal,
    bride_principal = EXCLUDED.bride_principal,
    suitor_id = COALESCE(EXCLUDED.suitor_id, mahr_records.suitor_id),
    bride_id = COALESCE(EXCLUDED.bride_id, mahr_records.bride_id),
    deposited_at = COALESCE(EXCLUDED.deposited_at, mahr_records.deposited_at),
    unlock_date = COALESCE(EXCLUDED.unlock_date, mahr_records.unlock_date),
    accepted = COALESCE(EXCLUDED.accepted, mahr_records.accepted),
    transferred = COALESCE(EXCLUDED.transferred, mahr_records.transferred),
    withdrawn = COALESCE(EXCLUDED.withdrawn, mahr_records.withdrawn),
    returned = COALESCE(EXCLUDED.returned, mahr_records.returned),
    rejected = COALESCE(EXCLUDED.rejected, mahr_records.rejected),
    last_event = COALESCE(EXCLUDED.last_event, mahr_records.last_event),
    updated_at = NOW()
  RETURNING m.*;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- View: per-user mahr records, duplicated for suitor and bride roles
CREATE OR REPLACE VIEW user_mahr_profile_view AS
SELECT
  u.id AS user_id,
  'suitor'::TEXT AS role,
  m.xft_id,
  m.xft_contract,
  m.amount,
  m.vault,
  m.deposited_at,
  m.unlock_date,
  m.accepted,
  m.transferred,
  m.withdrawn,
  m.returned,
  m.rejected,
  m.last_event,
  m.updated_at
FROM mahr_records m
JOIN users u ON u.id = m.suitor_id
UNION ALL
SELECT
  u.id AS user_id,
  'bride'::TEXT AS role,
  m.xft_id,
  m.xft_contract,
  m.amount,
  m.vault,
  m.deposited_at,
  m.unlock_date,
  m.accepted,
  m.transferred,
  m.withdrawn,
  m.returned,
  m.rejected,
  m.last_event,
  m.updated_at
FROM mahr_records m
JOIN users u ON u.id = m.bride_id;

-- Helper: get all mahrs for a given user
CREATE OR REPLACE FUNCTION get_user_mahrs(p_user_id UUID)
RETURNS SETOF user_mahr_profile_view AS $$
  SELECT * FROM user_mahr_profile_view WHERE user_id = p_user_id
$$ LANGUAGE sql STABLE;

-- Helper: per-user status counts
CREATE OR REPLACE FUNCTION get_user_mahr_status_counts(p_user_id UUID)
RETURNS TABLE (
  total INTEGER,
  accepted INTEGER,
  transferred INTEGER,
  withdrawn INTEGER,
  returned INTEGER,
  rejected INTEGER
) AS $$
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE accepted) AS accepted,
    COUNT(*) FILTER (WHERE transferred) AS transferred,
    COUNT(*) FILTER (WHERE withdrawn) AS withdrawn,
    COUNT(*) FILTER (WHERE returned) AS returned,
    COUNT(*) FILTER (WHERE rejected) AS rejected
  FROM user_mahr_profile_view
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_user_by_principal(p_principal TEXT)
RETURNS users AS $$
  SELECT * FROM users WHERE principal = p_principal LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_profile_by_principal(p_principal TEXT)
RETURNS user_profile_view AS $$
  SELECT v.* FROM user_profile_view v JOIN users u ON u.id = v.id WHERE u.principal = p_principal LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upsert_user_minimal(
  p_principal TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_profile_photo TEXT DEFAULT NULL
) RETURNS users AS $$
DECLARE
  v_user users;
BEGIN
  INSERT INTO users (principal, first_name, last_name, gender, location, bio, interests, profile_photo, is_active, last_active)
  VALUES (p_principal, p_first_name, p_last_name, p_gender, p_location, p_bio, p_interests, p_profile_photo, TRUE, NOW())
  ON CONFLICT (principal) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    gender = COALESCE(EXCLUDED.gender, users.gender),
    location = COALESCE(EXCLUDED.location, users.location),
    bio = COALESCE(EXCLUDED.bio, users.bio),
    interests = COALESCE(EXCLUDED.interests, users.interests),
    profile_photo = COALESCE(EXCLUDED.profile_photo, users.profile_photo),
    is_active = TRUE,
    last_active = NOW(),
    updated_at = NOW()
  RETURNING * INTO v_user;
  RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_profile_json(
  p_principal TEXT,
  p_profile JSONB
) RETURNS users AS $$
DECLARE v_user users;
BEGIN
  UPDATE users SET
    first_name = COALESCE(p_profile->>'first_name', first_name),
    last_name = COALESCE(p_profile->>'last_name', last_name),
    age = COALESCE(NULLIF(p_profile->>'age','')::INT, age),
    gender = COALESCE(p_profile->>'gender', gender),
    date_of_birth = COALESCE(NULLIF(p_profile->>'date_of_birth','')::DATE, date_of_birth),
    location = COALESCE(p_profile->>'location', location),
    bio = COALESCE(p_profile->>'bio', bio),
    education = COALESCE(p_profile->>'education', education),
    profession = COALESCE(p_profile->>'profession', profession),
    employer = COALESCE(p_profile->>'employer', employer),
    job_title = COALESCE(p_profile->>'job_title', job_title),
    marital_status = COALESCE(p_profile->>'marital_status', marital_status),
    has_children = COALESCE((p_profile->>'has_children')::BOOLEAN, has_children),
    wants_children = COALESCE((p_profile->>'wants_children')::BOOLEAN, wants_children),
    want_children = COALESCE(p_profile->>'want_children', want_children),
    religiosity = COALESCE(p_profile->>'religiosity', religiosity),
    prayer_frequency = COALESCE(p_profile->>'prayer_frequency', prayer_frequency),
    hijab_preference = COALESCE(p_profile->>'hijab_preference', hijab_preference),
    marriage_intention = COALESCE(p_profile->>'marriage_intention', marriage_intention),
    is_revert = COALESCE((p_profile->>'is_revert')::BOOLEAN, is_revert),
    alcohol = COALESCE(p_profile->>'alcohol', alcohol),
    smoking = COALESCE(p_profile->>'smoking', smoking),
    psychedelics = COALESCE(p_profile->>'psychedelics', psychedelics),
    halal_food = COALESCE(p_profile->>'halal_food', halal_food),
    profile_photo = COALESCE(p_profile->>'profile_photo', profile_photo),
    profile_photos = COALESCE(p_profile->'profile_photos', profile_photos),
    additional_photos = COALESCE(p_profile->'additional_photos', additional_photos),
    video_intro = COALESCE(p_profile->>'video_intro', video_intro),
    voice_intro = COALESCE(p_profile->>'voice_intro', voice_intro),
    interests = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_profile->'interests')), interests),
    updated_at = NOW()
  WHERE principal = p_principal
  RETURNING * INTO v_user;
  RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_settings_json(
  p_principal TEXT,
  p_settings JSONB
) RETURNS user_settings AS $$
DECLARE v_settings user_settings;
BEGIN
  INSERT INTO user_settings (user_id)
  SELECT id FROM users WHERE principal = p_principal
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE user_settings SET
    age_range_min = COALESCE(NULLIF(p_settings->>'age_range_min','')::INT, age_range_min),
    age_range_max = COALESCE(NULLIF(p_settings->>'age_range_max','')::INT, age_range_max),
    max_distance = COALESCE(NULLIF(p_settings->>'max_distance','')::INT, max_distance),
    anywhere_in_world = COALESCE((p_settings->>'anywhere_in_world')::BOOLEAN, anywhere_in_world),
    show_only_verified = COALESCE((p_settings->>'show_only_verified')::BOOLEAN, show_only_verified),
    show_only_practicing = COALESCE((p_settings->>'show_only_practicing')::BOOLEAN, show_only_practicing),
    preferred_interests = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_interests')), preferred_interests),
    preferred_religiosity = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_religiosity')), preferred_religiosity),
    preferred_prayer_frequency = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_prayer_frequency')), preferred_prayer_frequency),
    preferred_hijab = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_hijab')), preferred_hijab),
    preferred_marriage_intention = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_marriage_intention')), preferred_marriage_intention),
    preferred_nationality = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_nationality')), preferred_nationality),
    preferred_height_range = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_height_range')), preferred_height_range),
    preferred_marital_status = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_marital_status')), preferred_marital_status),
    preferred_children = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_children')), preferred_children),
    preferred_education = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'preferred_education')), preferred_education),
    education_preference = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'education_preference')), education_preference),
    occupation_preference = COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_settings->'occupation_preference')), occupation_preference),
    require_financial_setup = COALESCE((p_settings->>'require_financial_setup')::BOOLEAN, require_financial_setup),
    bio_rating_minimum = COALESCE(NULLIF(p_settings->>'bio_rating_minimum','')::INT, bio_rating_minimum),
    response_rate_minimum = COALESCE(NULLIF(p_settings->>'response_rate_minimum','')::INT, response_rate_minimum),
    notifications_matches = COALESCE((p_settings->>'notifications_matches')::BOOLEAN, notifications_matches),
    notifications_messages = COALESCE((p_settings->>'notifications_messages')::BOOLEAN, notifications_messages),
    notifications_profile_views = COALESCE((p_settings->>'notifications_profile_views')::BOOLEAN, notifications_profile_views),
    notifications_likes = COALESCE((p_settings->>'notifications_likes')::BOOLEAN, notifications_likes),
    push_notifications = COALESCE((p_settings->>'push_notifications')::BOOLEAN, push_notifications),
    email_notifications = COALESCE((p_settings->>'email_notifications')::BOOLEAN, email_notifications),
    show_age = COALESCE((p_settings->>'show_age')::BOOLEAN, show_age),
    show_location = COALESCE((p_settings->>'show_location')::BOOLEAN, show_location),
    show_last_seen = COALESCE((p_settings->>'show_last_seen')::BOOLEAN, show_last_seen),
    show_online_status = COALESCE((p_settings->>'show_online_status')::BOOLEAN, show_online_status),
    updated_at = NOW()
  WHERE user_id = (SELECT id FROM users WHERE principal = p_principal)
  RETURNING * INTO v_settings;
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_users_text(
  p_search_text TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS SETOF user_profile_view AS $$
  SELECT v.* FROM user_profile_view v
  JOIN users u ON u.id = v.id
  WHERE to_tsvector('english', COALESCE(u.full_name,'') || ' ' || COALESCE(u.bio,'') || ' ' || COALESCE(array_to_string(u.interests,' '),''))
    @@ plainto_tsquery('english', p_search_text)
  ORDER BY u.updated_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION set_user_location(
  p_principal TEXT,
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION,
  p_location TEXT DEFAULT NULL
) RETURNS users AS $$
DECLARE v_user users;
BEGIN
  UPDATE users SET
    latitude = p_lat,
    longitude = p_lon,
    location_point = ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
    location = COALESCE(p_location, location),
    updated_at = NOW()
  WHERE principal = p_principal
  RETURNING * INTO v_user;
  RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_last_active(p_principal TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET last_active = NOW(), updated_at = NOW() WHERE principal = p_principal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Supabase Storage Buckets (Profile media and Shop product assets)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'create_bucket' AND n.nspname = 'storage'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-photos') THEN
      PERFORM storage.create_bucket('profile-photos'::text, true, 52428800::bigint, ARRAY['image/jpeg','image/jpg','image/png','image/webp']::text[]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-videos') THEN
      PERFORM storage.create_bucket('profile-videos'::text, true, 52428800::bigint, ARRAY['video/mp4','video/webm','video/mov','video/avi']::text[]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-audio') THEN
      PERFORM storage.create_bucket('profile-audio'::text, true, 52428800::bigint, ARRAY['audio/mp3','audio/wav','audio/m4a','audio/ogg']::text[]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'shop-images') THEN
      PERFORM storage.create_bucket('shop-images'::text, true, 52428800::bigint, ARRAY['image/jpeg','image/jpg','image/png','image/webp']::text[]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'shop-videos') THEN
      PERFORM storage.create_bucket('shop-videos'::text, true, 52428800::bigint, ARRAY['video/mp4','video/webm','video/mov','video/avi']::text[]);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- RLS Hardening: Enable RLS and revoke public access on sensitive tables
-- ============================================================================
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','user_settings',
    'shops','products','product_variants','product_variant_options','inventory',
    'shopping_carts','cart_items',
    'orders','order_items','payments',
    'product_reviews','shop_reviews','wishlists',
    'messages','chat_conversations','chat_members','chat_messages','chat_read_receipts','chat_bans',
    'user_bans','user_probations',
    'meeting_requests','marriage_proposals',
    'mahr_records'
  ] LOOP
    EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', tbl);
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON %I FROM anon', tbl);
      EXECUTE format('REVOKE ALL ON %I FROM authenticated', tbl);
    END IF;
  END LOOP;

  -- Drop any previously created broad read-all policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_read_all') THEN
    DROP POLICY users_read_all ON users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_settings' AND policyname='user_settings_read_all') THEN
    DROP POLICY user_settings_read_all ON user_settings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shops' AND policyname='shops_read_all') THEN
    DROP POLICY shops_read_all ON shops;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_read_all') THEN
    DROP POLICY products_read_all ON products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='orders_read_all') THEN
    DROP POLICY orders_read_all ON orders;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='messages_read_all') THEN
    DROP POLICY messages_read_all ON messages;
  END IF;
END $$;

-- Make storage buckets private if the update function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_bucket' AND n.nspname = 'storage'
  ) THEN
    PERFORM storage.update_bucket('profile-photos'::text, false);
    PERFORM storage.update_bucket('profile-videos'::text, false);
    PERFORM storage.update_bucket('profile-audio'::text, false);
    PERFORM storage.update_bucket('shop-images'::text, false);
    PERFORM storage.update_bucket('shop-videos'::text, false);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON users FROM anon;
    GRANT SELECT ON users TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_read_all'
    ) THEN
      CREATE POLICY users_read_all ON users FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.user_settings') IS NOT NULL THEN
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON user_settings FROM anon;
    GRANT SELECT ON user_settings TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'user_settings_read_all'
    ) THEN
      CREATE POLICY user_settings_read_all ON user_settings FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.shops') IS NOT NULL THEN
    ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON shops FROM anon;
    GRANT SELECT ON shops TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shops' AND policyname = 'shops_read_all'
    ) THEN
      CREATE POLICY shops_read_all ON shops FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON products FROM anon;
    GRANT SELECT ON products TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_read_all'
    ) THEN
      CREATE POLICY products_read_all ON products FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON orders FROM anon;
    GRANT SELECT ON orders TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'orders_read_all'
    ) THEN
      CREATE POLICY orders_read_all ON orders FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.messages') IS NOT NULL THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON messages FROM anon;
    GRANT SELECT ON messages TO anon;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_read_all'
    ) THEN
      CREATE POLICY messages_read_all ON messages FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
CREATE OR REPLACE FUNCTION bio_uniqueness_percent(p_bio TEXT, p_neighbors INTEGER DEFAULT 25)
RETURNS INTEGER AS $$
WITH sims AS (
  SELECT similarity(u.bio, p_bio) AS sim
  FROM users u
  WHERE u.bio IS NOT NULL AND u.bio <> ''
  ORDER BY similarity(u.bio, p_bio) DESC
  LIMIT p_neighbors
)
SELECT ROUND((1 - COALESCE(MAX(sim), 0)) * 100)::INT FROM sims;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION set_bio_unique_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bio IS NULL OR NEW.bio = '' THEN
    NEW.bio_unique_score := 0;
  ELSE
    NEW.bio_unique_score := bio_uniqueness_percent(NEW.bio);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_bio_unique'
  ) THEN
    CREATE TRIGGER users_set_bio_unique
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_bio_unique_score();
  END IF;
END $$;
