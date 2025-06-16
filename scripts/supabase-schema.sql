-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE religiosity_level AS ENUM ('very_religious', 'religious', 'moderate', 'learning');
CREATE TYPE prayer_frequency AS ENUM ('five_times_daily', 'regularly', 'sometimes', 'learning');
CREATE TYPE hijab_preference AS ENUM ('always', 'sometimes', 'planning', 'no');
CREATE TYPE marriage_intention AS ENUM ('soon', 'within_year', 'future');
CREATE TYPE education_level AS ENUM ('high_school', 'bachelors', 'masters', 'phd', 'trade_school', 'other');
CREATE TYPE marital_status AS ENUM ('never_married', 'divorced', 'widowed');
CREATE TYPE message_type AS ENUM ('text', 'audio', 'video', 'image', 'file');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE currency_type AS ENUM ('SOL', 'SAMAA', 'USD');
CREATE TYPE notification_type AS ENUM ('match', 'message', 'profile_view', 'like', 'super_like', 'order_update');
CREATE TYPE match_action AS ENUM ('like', 'pass', 'super_like', 'block');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Users table (main profile table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solana_address TEXT UNIQUE NOT NULL, -- Primary identifier
    dowry_wallet_address TEXT,
    purse_wallet_address TEXT,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    gender gender_type NOT NULL,
    date_of_birth DATE NOT NULL,
    
    -- Location
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    
    -- Education & Profession
    education education_level,
    profession TEXT,
    
    -- Islamic Values
    religiosity religiosity_level,
    prayer_frequency prayer_frequency,
    hijab_preference hijab_preference,
    marriage_intention marriage_intention,
    born_muslim BOOLEAN DEFAULT true,
    
    -- Profile Content
    bio TEXT,
    bio_rating INTEGER DEFAULT 0 CHECK (bio_rating >= 0 AND bio_rating <= 100),
    interests TEXT[], -- Array of interests
    
    -- Profile Media
    profile_photos TEXT[], -- Array of photo URLs
    profile_video TEXT,
    voice_intro TEXT,
    
    -- Verification & Status
    is_verified BOOLEAN DEFAULT false,
    verification_status verification_status DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metrics
    response_rate DECIMAL(5,2) DEFAULT 0.0,
    profile_views INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Matching Preferences
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 60,
    max_distance INTEGER DEFAULT 50, -- in kilometers
    preferred_gender gender_type,
    
    -- Faith & Practice Filters
    religiosity_preference religiosity_level[],
    prayer_frequency_preference prayer_frequency[],
    hijab_preference_filter hijab_preference[],
    born_muslim_preference BOOLEAN,
    
    -- Demographics Filters
    education_preference education_level[],
    marital_status_preference marital_status[],
    height_min INTEGER, -- in cm
    height_max INTEGER, -- in cm
    
    -- Quality Filters
    require_financial_setup BOOLEAN DEFAULT false,
    bio_rating_minimum INTEGER DEFAULT 70,
    response_rate_minimum INTEGER DEFAULT 50,
    verified_only BOOLEAN DEFAULT false,
    
    -- Notification Settings
    notifications_matches BOOLEAN DEFAULT true,
    notifications_messages BOOLEAN DEFAULT true,
    notifications_profile_views BOOLEAN DEFAULT false,
    notifications_likes BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    
    -- Privacy Settings
    show_age BOOLEAN DEFAULT true,
    show_location BOOLEAN DEFAULT true,
    show_last_seen BOOLEAN DEFAULT false,
    show_online_status BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Match quality score
    compatibility_score DECIMAL(5,2),
    
    UNIQUE(user1_id, user2_id)
);

-- User Actions table (likes, passes, blocks)
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action match_action NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(actor_id, target_id)
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_preview TEXT,
    
    -- Conversation settings
    is_archived_user1 BOOLEAN DEFAULT false,
    is_archived_user2 BOOLEAN DEFAULT false,
    is_muted_user1 BOOLEAN DEFAULT false,
    is_muted_user2 BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    message_type message_type NOT NULL DEFAULT 'text',
    content TEXT, -- Text content or file description
    media_url TEXT, -- URL for audio, video, image files
    media_duration INTEGER, -- Duration in seconds for audio/video
    media_size INTEGER, -- File size in bytes
    
    -- Message status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    
    -- Reply functionality
    reply_to_message_id UUID REFERENCES messages(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shops table
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    owner_wallet TEXT, -- Solana wallet address for payments

    name TEXT NOT NULL,
    description TEXT,
    shop_image TEXT,

    -- Contact information
    contact_email TEXT,
    contact_phone TEXT,

    -- Shop metrics
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,

    -- Shop settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY, -- Auto-incrementing for URL-friendly IDs
    uuid UUID UNIQUE DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id),
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,4) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'SAMAA',
    
    -- Product media
    images TEXT[], -- Array of image URLs
    video_url TEXT,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    is_in_stock BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    
    -- Product metrics
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- SEO & Discovery
    tags TEXT[],
    slug TEXT UNIQUE, -- URL-friendly identifier
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    buyer_wallet TEXT NOT NULL, -- Solana wallet address
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    items JSONB, -- Cart items for simplified storage
    
    -- Order totals
    subtotal DECIMAL(10,4) NOT NULL,
    tax_amount DECIMAL(10,4) DEFAULT 0,
    shipping_amount DECIMAL(10,4) DEFAULT 0,
    total_amount DECIMAL(10,4) NOT NULL,
    currency currency_type NOT NULL,
    
    -- Order status
    status order_status DEFAULT 'pending',
    
    -- Shipping information
    shipping_address JSONB, -- Flexible address storage
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment information
    payment_method TEXT,
    transaction_hash TEXT, -- Blockchain transaction hash
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,4) NOT NULL,
    total_price DECIMAL(10,4) NOT NULL,
    
    -- Snapshot of product at time of order
    product_name TEXT NOT NULL,
    product_description TEXT,
    product_image TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (for both users and products)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Can review either a user or a product
    reviewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewed_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id), -- For product reviews
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    
    -- Review media
    images TEXT[],
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one review per user per product/user
    CONSTRAINT unique_user_review UNIQUE (reviewer_id, reviewed_user_id),
    CONSTRAINT unique_product_review UNIQUE (reviewer_id, reviewed_product_id, order_id),
    CONSTRAINT review_target_check CHECK (
        (reviewed_user_id IS NOT NULL AND reviewed_product_id IS NULL) OR
        (reviewed_user_id IS NULL AND reviewed_product_id IS NOT NULL)
    )
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_user_id UUID REFERENCES users(id),
    related_match_id UUID REFERENCES matches(id),
    related_message_id UUID REFERENCES messages(id),
    related_order_id UUID REFERENCES orders(id),
    
    -- Notification status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional data
    data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User verification documents
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    document_type TEXT NOT NULL, -- 'id', 'selfie', 'address_proof', etc.
    document_url TEXT NOT NULL,
    
    status verification_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked users table
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id)
);

-- Reported content table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Can report users, messages, or products
    reported_user_id UUID REFERENCES users(id),
    reported_message_id UUID REFERENCES messages(id),
    reported_product_id INTEGER REFERENCES products(id),
    
    reason TEXT NOT NULL,
    description TEXT,
    
    -- Moderation
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking activity
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    location_info JSONB,
    
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    event_type TEXT NOT NULL,
    event_data JSONB,
    
    -- Context
    session_id UUID REFERENCES user_sessions(id),
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_solana_address ON users(solana_address);
CREATE INDEX idx_users_location_point ON users USING GIST(location_point);
CREATE INDEX idx_users_gender_age ON users(gender, age);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_matches_active ON matches(is_active);

CREATE INDEX idx_user_actions_actor ON user_actions(actor_id);
CREATE INDEX idx_user_actions_target ON user_actions(target_id);
CREATE INDEX idx_user_actions_action ON user_actions(action);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = false;

CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Create functions for common operations

-- Function to calculate distance between users
CREATE OR REPLACE FUNCTION calculate_user_distance(user1_id UUID, user2_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    distance DECIMAL;
BEGIN
    SELECT ST_Distance(
        u1.location_point::geometry,
        u2.location_point::geometry
    ) / 1000 -- Convert to kilometers
    INTO distance
    FROM users u1, users u2
    WHERE u1.id = user1_id AND u2.id = user2_id;
    
    RETURN COALESCE(distance, 999999);
END;
$$ LANGUAGE plpgsql;

-- Function to update user's last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Function to automatically create user settings when user is created
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id, preferred_gender)
    VALUES (NEW.id, CASE WHEN NEW.gender = 'male' THEN 'female' ELSE 'male' END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_settings_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_settings();

-- Insert default product categories
INSERT INTO product_categories (name, description, sort_order) VALUES
('Women''s Clothes', 'Modest clothing for women', 1),
('Men''s Clothes', 'Traditional and modern clothing for men', 2),
('Arts & Crafts', 'Islamic art, calligraphy, and handmade items', 3),
('Accessories', 'Prayer beads, jewelry, and accessories', 4),
('Shoes', 'Modest and comfortable footwear', 5),
('Hand Bags', 'Bags and purses for daily use', 6),
('Books', 'Islamic books and educational materials', 7),
('Home Decor', 'Islamic home decoration items', 8),
('NFTs', 'Digital collectibles and Islamic art NFTs', 9);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data and public profiles
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (solana_address = current_setting('app.current_user_address'));

-- Users can only see their own settings
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (user_id::text = current_setting('app.current_user_id'));

-- Users can only see messages in their conversations
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        sender_id::text = current_setting('app.current_user_id') OR
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user1_id::text = current_setting('app.current_user_id') 
               OR user2_id::text = current_setting('app.current_user_id')
        )
    );

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR ALL USING (user_id::text = current_setting('app.current_user_id'));
