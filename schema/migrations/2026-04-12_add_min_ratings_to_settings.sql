-- Add minimum rating preference columns to user_settings table
-- These are used for match filtering based on bio and chat ratings
-- Date: 2026-04-12

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS min_bio_rating INTEGER DEFAULT 0 CHECK (min_bio_rating >= 0 AND min_bio_rating <= 100),
ADD COLUMN IF NOT EXISTS min_chat_rating INTEGER DEFAULT 0 CHECK (min_chat_rating >= 0 AND min_chat_rating <= 100);

-- Add comments for documentation
COMMENT ON COLUMN user_settings.min_bio_rating IS 'Minimum bio rating percentage required for matches';
COMMENT ON COLUMN user_settings.min_chat_rating IS 'Minimum chat rating percentage required for matches';
