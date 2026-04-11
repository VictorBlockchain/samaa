-- Add match preference columns to user_settings table
-- These are the user's preferences for what they want in a partner
-- Date: 2026-04-15

-- Faith & Practice preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS sect_preference TEXT,
ADD COLUMN IF NOT EXISTS is_revert_preference TEXT,
ADD COLUMN IF NOT EXISTS marriage_timeline_preference TEXT,
ADD COLUMN IF NOT EXISTS halal_food_preference TEXT,
ADD COLUMN IF NOT EXISTS alcohol_preference TEXT,
ADD COLUMN IF NOT EXISTS smoking_preference TEXT,
ADD COLUMN IF NOT EXISTS psychedelics_preference TEXT,
ADD COLUMN IF NOT EXISTS psychedelics_types_preference TEXT[],
ADD COLUMN IF NOT EXISTS family_involvement_preference TEXT,
ADD COLUMN IF NOT EXISTS polygamy_perspective_preference TEXT;

-- Personal Details preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS height_min INTEGER,
ADD COLUMN IF NOT EXISTS living_arrangements_preference TEXT,
ADD COLUMN IF NOT EXISTS mahr_preference TEXT,
ADD COLUMN IF NOT EXISTS occupation_preference_single TEXT,
ADD COLUMN IF NOT EXISTS personality_preference TEXT[],
ADD COLUMN IF NOT EXISTS has_video_preference BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_audio_preference BOOLEAN DEFAULT FALSE;

-- Lifestyle & Finance preferences
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS spending_preference TEXT,
ADD COLUMN IF NOT EXISTS fine_dining_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS shopping_budget_preference TEXT,
ADD COLUMN IF NOT EXISTS self_care_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS self_care_budget_preference TEXT;

-- Add indexes for frequently queried preference columns
CREATE INDEX IF NOT EXISTS idx_user_settings_sect ON user_settings(sect_preference);
CREATE INDEX IF NOT EXISTS idx_user_settings_marriage_timeline ON user_settings(marriage_timeline_preference);
CREATE INDEX IF NOT EXISTS idx_user_settings_spending ON user_settings(spending_preference);
CREATE INDEX IF NOT EXISTS idx_user_settings_personality ON user_settings USING GIN (personality_preference);
CREATE INDEX IF NOT EXISTS idx_user_settings_psychedelics_types ON user_settings USING GIN (psychedelics_types_preference);
