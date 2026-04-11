-- Create social categories table for video categories
CREATE TABLE IF NOT EXISTS social_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social videos table
CREATE TABLE IF NOT EXISTS social_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES social_categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    flags_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    flag_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video comments table
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES social_videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE, -- for replies
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video flags table
CREATE TABLE IF NOT EXISTS video_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES social_videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(video_id, user_id) -- prevent duplicate flags from same user
);

-- Create video likes table
CREATE TABLE IF NOT EXISTS video_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES social_videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(video_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_videos_user_id ON social_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_social_videos_category_id ON social_videos(category_id);
CREATE INDEX IF NOT EXISTS idx_social_videos_created_at ON social_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_videos_is_available ON social_videos(is_available);
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_flags_video_id ON video_flags(video_id);

-- Enable RLS
ALTER TABLE social_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_categories (public read)
CREATE POLICY social_categories_read ON social_categories
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

-- RLS Policies for social_videos
CREATE POLICY social_videos_read ON social_videos
    FOR SELECT TO anon, authenticated
    USING (is_available = true AND is_flagged = false);

CREATE POLICY social_videos_create ON social_videos
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY social_videos_update_own ON social_videos
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY social_videos_delete_own ON social_videos
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for video_comments
CREATE POLICY video_comments_read ON video_comments
    FOR SELECT TO anon, authenticated
    USING (is_deleted = false);

CREATE POLICY video_comments_create ON video_comments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY video_comments_update_own ON video_comments
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY video_comments_delete_own ON video_comments
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for video_flags
CREATE POLICY video_flags_create ON video_flags
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY video_flags_read_own ON video_flags
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for video_likes
CREATE POLICY video_likes_read ON video_likes
    FOR SELECT TO anon, authenticated;

CREATE POLICY video_likes_create ON video_likes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY video_likes_delete_own ON video_likes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Insert default categories
INSERT INTO social_categories (name, slug, description, icon, color, display_order) VALUES
    ('Women Only', 'women-only', 'A safe space for women to share and connect', '👩', 'from-pink-400 to-rose-500', 1),
    ('Beauty', 'beauty', 'Beauty tips, tutorials, and product reviews', '💄', 'from-purple-400 to-pink-500', 2),
    ('Fashion', 'fashion', 'Modest fashion inspiration and styling', '👗', 'from-amber-400 to-orange-500', 3),
    ('Islam', 'islam', 'Islamic reminders, lectures, and discussions', '🕌', 'from-emerald-400 to-teal-500', 4),
    ('Quran', 'quran', 'Quran recitations, tafsir, and learning', '📖', 'from-cyan-400 to-blue-500', 5),
    ('Recipe', 'recipe', 'Halal recipes and cooking tutorials', '🍽️', 'from-green-400 to-emerald-500', 6),
    ('Couples', 'couples', 'Marriage tips and relationship advice', '💑', 'from-rose-400 to-pink-500', 7),
    ('Mens Corner', 'mens-corner', 'Discussions and content for brothers', '👨', 'from-blue-400 to-indigo-500', 8),
    ('Humor', 'humor', 'Halal humor and light-hearted content', '😄', 'from-yellow-400 to-amber-500', 9),
    ('Travel', 'travel', 'Islamic travel destinations and experiences', '✈️', 'from-sky-400 to-cyan-500', 10)
ON CONFLICT (slug) DO NOTHING;

-- Function to update video availability when flags reach threshold
CREATE OR REPLACE FUNCTION check_video_flags()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE social_videos
    SET is_available = false,
        is_flagged = true,
        flags_count = flags_count + 1
    WHERE id = NEW.video_id
    AND flags_count + 1 >= flag_threshold;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check flags on insert
DROP TRIGGER IF EXISTS trg_check_video_flags ON video_flags;
CREATE TRIGGER trg_check_video_flags
    AFTER INSERT ON video_flags
    FOR EACH ROW
    EXECUTE FUNCTION check_video_flags();

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE social_videos
    SET comments_count = comments_count + 1
    WHERE id = NEW.video_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_comments ON video_comments;
CREATE TRIGGER trg_increment_comments
    AFTER INSERT ON video_comments
    FOR EACH ROW
    EXECUTE FUNCTION increment_comments_count();

-- Function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE social_videos
    SET comments_count = comments_count - 1
    WHERE id = OLD.video_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_comments ON video_comments;
CREATE TRIGGER trg_decrement_comments
    AFTER DELETE ON video_comments
    FOR EACH ROW
    EXECUTE FUNCTION decrement_comments_count();

-- Grant permissions
GRANT SELECT ON social_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video_comments TO authenticated;
GRANT SELECT, INSERT ON video_flags TO authenticated;
GRANT SELECT, INSERT, DELETE ON video_likes TO authenticated;
