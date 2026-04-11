-- Create new user_preferences table with clean, standardized naming
-- This replaces the messy user_settings table with a properly structured schema
-- Date: 2026-04-15

-- ============================================================================
-- 1. CREATE NEW user_preferences TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- ========================================================================
    -- DISCOVERY PREFERENCES (what you're looking for in matches)
    -- ========================================================================
    age_range_min INTEGER DEFAULT 18,
    age_range_max INTEGER DEFAULT 60,
    max_distance INTEGER DEFAULT 50,
    anywhere_in_world BOOLEAN DEFAULT FALSE,
    show_only_verified BOOLEAN DEFAULT FALSE,
    show_only_practicing BOOLEAN DEFAULT FALSE,
    
    -- ========================================================================
    -- ISLAM VALUES PREFERENCES
    -- ========================================================================
    prayer_frequency_preference TEXT,
    hijab_preference TEXT,
    marriage_timeline_preference TEXT,
    halal_food_preference TEXT,
    alcohol_preference TEXT,
    smoking_preference TEXT,
    psychedelics_preference TEXT,
    psychedelics_types_preference TEXT[],
    sect_preference TEXT,
    is_revert_preference TEXT,
    religiosity_preference TEXT[],
    family_involvement_preference TEXT,
    polygamy_preference_answered BOOLEAN DEFAULT FALSE,
    polygamy_perspective_preference TEXT,
    
    -- ========================================================================
    -- PERSONAL DETAILS PREFERENCES
    -- ========================================================================
    nationality_preference TEXT[],
    education_preference TEXT[],
    height_preference TEXT,
    height_min_preference INTEGER,
    languages_preference TEXT,
    willing_to_relocate_preference TEXT,
    living_arrangements_preference TEXT,
    mahr_preference_type TEXT CHECK (mahr_preference_type IN ('less_than', 'greater_than')),
    mahr_preference_amount INTEGER,
    occupation_preference TEXT,
    personality_preference TEXT[],
    has_video_preference BOOLEAN DEFAULT FALSE,
    has_audio_preference BOOLEAN DEFAULT FALSE,
    
    -- ========================================================================
    -- LIFESTYLE & FINANCE PREFERENCES
    -- ========================================================================
    spending_preference TEXT,
    fine_dining_frequency_preference TEXT,
    travel_frequency_preference TEXT,
    shopping_budget_preference_type TEXT CHECK (shopping_budget_preference_type IN ('less_than', 'greater_than')),
    shopping_budget_preference_amount INTEGER,
    self_care_frequency_preference TEXT,
    self_care_budget_preference_type TEXT CHECK (self_care_budget_preference_type IN ('less_than', 'greater_than')),
    self_care_budget_preference_amount INTEGER,
    
    -- ========================================================================
    -- INTERESTS
    -- ========================================================================
    interests_preference TEXT[],
    
    -- ========================================================================
    -- REQUIREMENTS (minimum thresholds)
    -- ========================================================================
    require_financial_setup_preference BOOLEAN DEFAULT FALSE,
    profile_rating_minimum_preference INTEGER DEFAULT 0,
    response_rate_minimum_preference INTEGER DEFAULT 0,
    
    -- ========================================================================
    -- NOTIFICATION SETTINGS (not preferences, so no _preference suffix)
    -- ========================================================================
    notifications_matches BOOLEAN DEFAULT TRUE,
    notifications_messages BOOLEAN DEFAULT TRUE,
    notifications_profile_views BOOLEAN DEFAULT TRUE,
    notifications_likes BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    
    -- ========================================================================
    -- PRIVACY SETTINGS (not preferences, so no _preference suffix)
    -- ========================================================================
    show_age BOOLEAN DEFAULT TRUE,
    show_location BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    
    -- ========================================================================
    -- TIMESTAMPS
    -- ========================================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================
    UNIQUE(user_id),
    CHECK (age_range_min >= 18 AND age_range_min <= 100),
    CHECK (age_range_max >= 18 AND age_range_max <= 100),
    CHECK (age_range_min <= age_range_max),
    CHECK (max_distance >= 0 AND max_distance <= 1000),
    CHECK (profile_rating_minimum_preference >= 0 AND profile_rating_minimum_preference <= 100),
    CHECK (response_rate_minimum_preference >= 0 AND response_rate_minimum_preference <= 100)
);

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_age_range ON user_preferences(age_range_min, age_range_max);
CREATE INDEX IF NOT EXISTS idx_user_preferences_max_distance ON user_preferences(max_distance);
CREATE INDEX IF NOT EXISTS idx_user_preferences_interests ON user_preferences USING GIN (interests_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_education ON user_preferences USING GIN (education_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_religiosity ON user_preferences USING GIN (religiosity_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_personality ON user_preferences USING GIN (personality_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_psychedelics_types ON user_preferences USING GIN (psychedelics_types_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_mahr ON user_preferences(mahr_preference_type, mahr_preference_amount);
CREATE INDEX IF NOT EXISTS idx_user_preferences_sect ON user_preferences(sect_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_marriage_timeline ON user_preferences(marriage_timeline_preference);
CREATE INDEX IF NOT EXISTS idx_user_preferences_shopping_budget ON user_preferences(shopping_budget_preference_type, shopping_budget_preference_amount);
CREATE INDEX IF NOT EXISTS idx_user_preferences_self_care_budget ON user_preferences(self_care_budget_preference_type, self_care_budget_preference_amount);
CREATE INDEX IF NOT EXISTS idx_user_preferences_polygamy ON user_preferences(polygamy_preference_answered);
CREATE INDEX IF NOT EXISTS idx_user_preferences_spending ON user_preferences(spending_preference);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES (Idempotent)
-- ============================================================================

-- Users can view their own preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view own preferences'
    ) THEN
        CREATE POLICY "Users can view own preferences" ON user_preferences
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Users can create their own preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can create own preferences'
    ) THEN
        CREATE POLICY "Users can create own preferences" ON user_preferences
            FOR INSERT
            TO authenticated
            WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Users can update their own preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update own preferences'
    ) THEN
        CREATE POLICY "Users can update own preferences" ON user_preferences
            FOR UPDATE
            TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Users can delete their own preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can delete own preferences'
    ) THEN
        CREATE POLICY "Users can delete own preferences" ON user_preferences
            FOR DELETE
            TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- ============================================================================
-- 5. CREATE TRIGGER FOR updated_at (Idempotent)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;

CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- ============================================================================
-- 6. MIGRATE EXISTING DATA FROM user_settings
-- ============================================================================

-- Migrate data from user_settings to user_preferences
INSERT INTO user_preferences (
    user_id,
    age_range_min,
    age_range_max,
    max_distance,
    anywhere_in_world,
    show_only_verified,
    show_only_practicing,
    interests_preference,
    religiosity_preference,
    nationality_preference,
    education_preference,
    require_financial_setup_preference,
    profile_rating_minimum_preference,
    response_rate_minimum_preference,
    notifications_matches,
    notifications_messages,
    notifications_profile_views,
    notifications_likes,
    push_notifications,
    email_notifications,
    show_age,
    show_location,
    show_last_seen,
    show_online_status,
    -- Islam values (from new columns)
    prayer_frequency_preference,
    hijab_preference,
    marriage_timeline_preference,
    halal_food_preference,
    alcohol_preference,
    smoking_preference,
    psychedelics_preference,
    psychedelics_types_preference,
    sect_preference,
    is_revert_preference,
    family_involvement_preference,
    polygamy_preference_answered,
    polygamy_perspective_preference,
    -- Personal details
    height_preference,
    height_min_preference,
    languages_preference,
    willing_to_relocate_preference,
    living_arrangements_preference,
    mahr_preference_type,
    mahr_preference_amount,
    occupation_preference,
    personality_preference,
    has_video_preference,
    has_audio_preference,
    -- Lifestyle & finance
    spending_preference,
    fine_dining_frequency_preference,
    travel_frequency_preference,
    shopping_budget_preference_type,
    shopping_budget_preference_amount,
    self_care_frequency_preference,
    self_care_budget_preference_type,
    self_care_budget_preference_amount
)
SELECT
    user_id,
    age_range_min,
    age_range_max,
    max_distance,
    anywhere_in_world,
    show_only_verified,
    show_only_practicing,
    preferred_interests AS interests_preference,
    preferred_religiosity AS religiosity_preference,
    preferred_nationality AS nationality_preference,
    preferred_education AS education_preference,
    require_financial_setup,
    COALESCE(profile_rating_minimum, 0),
    response_rate_minimum,
    notifications_matches,
    notifications_messages,
    notifications_profile_views,
    notifications_likes,
    push_notifications,
    email_notifications,
    show_age,
    show_location,
    show_last_seen,
    show_online_status,
    -- Islam values
    prayer_frequency AS prayer_frequency_preference,
    hijab_preference,
    marriage_timeline_preference,
    halal_food_preference,
    alcohol_preference,
    smoking_preference,
    psychedelics_preference,
    psychedelics_types_preference,
    sect_preference,
    is_revert_preference,
    family_involvement_preference,
    (polygamy_perspective_preference IS NOT NULL AND polygamy_perspective_preference != '') AS polygamy_preference_answered,
    polygamy_perspective_preference,
    -- Personal details
    height,
    height_min,
    languages,
    willing_to_relocate,
    living_arrangements_preference,
    NULL AS mahr_preference_type,
    NULL AS mahr_preference_amount,
    occupation_preference_single,
    personality_preference,
    has_video_preference,
    has_audio_preference,
    -- Lifestyle & finance
    spending_preference,
    fine_dining_frequency_preference,
    travel_frequency_preference,
    NULL AS shopping_budget_preference_type,
    NULL AS shopping_budget_preference_amount,
    self_care_frequency_preference,
    NULL AS self_care_budget_preference_type,
    NULL AS self_care_budget_preference_amount
FROM user_settings
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_preferences IS 'User match preferences and settings';
COMMENT ON COLUMN user_preferences.age_range_min IS 'Minimum age preference for matches';
COMMENT ON COLUMN user_preferences.age_range_max IS 'Maximum age preference for matches';
COMMENT ON COLUMN user_preferences.max_distance IS 'Maximum distance in miles for matches';
COMMENT ON COLUMN user_preferences.anywhere_in_world IS 'Enable global matching without distance limits';
COMMENT ON COLUMN user_preferences.religiosity_preference IS 'Preferred religiosity levels (array for multi-select)';
COMMENT ON COLUMN user_preferences.interests_preference IS 'Preferred interests for matching (array)';
COMMENT ON COLUMN user_preferences.mahr_preference_type IS 'Mahr filter type: less_than or greater_than';
COMMENT ON COLUMN user_preferences.mahr_preference_amount IS 'Mahr amount threshold for filtering';
COMMENT ON COLUMN user_preferences.polygamy_preference_answered IS 'Whether user has answered polygamy question (true/false)';
COMMENT ON COLUMN user_preferences.polygamy_perspective_preference IS 'User actual polygamy perspective text (shown to matches)';
COMMENT ON COLUMN user_preferences.shopping_budget_preference_type IS 'Shopping budget filter type: less_than or greater_than';
COMMENT ON COLUMN user_preferences.shopping_budget_preference_amount IS 'Shopping budget amount threshold';
COMMENT ON COLUMN user_preferences.self_care_budget_preference_type IS 'Self-care budget filter type: less_than or greater_than';
COMMENT ON COLUMN user_preferences.self_care_budget_preference_amount IS 'Self-care budget amount threshold';
COMMENT ON COLUMN user_preferences.profile_rating_minimum_preference IS 'Minimum profile rating percentage required';
COMMENT ON COLUMN user_preferences.response_rate_minimum_preference IS 'Minimum response rate percentage required';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Update application code to use user_preferences instead of user_settings
-- 2. Update database functions to reference user_preferences
-- 3. Once verified, can deprecate user_settings table
-- ============================================================================
