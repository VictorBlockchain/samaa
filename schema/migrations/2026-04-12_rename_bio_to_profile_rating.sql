-- Rename bio_rating to profile_rating throughout the database
-- This better reflects that we're measuring entire profile completeness, not just bio
-- Date: 2026-04-12

-- Rename column in users table
ALTER TABLE users RENAME COLUMN bio_rating TO profile_rating;

-- Rename column in user_settings table  
ALTER TABLE user_settings RENAME COLUMN bio_rating_minimum TO profile_rating_minimum;

-- Check if min_bio_rating exists before renaming (it may not exist yet)
DO $$ 
BEGIN
    -- Check if min_bio_rating column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' AND column_name = 'min_bio_rating'
    ) THEN
        ALTER TABLE user_settings RENAME COLUMN min_bio_rating TO min_profile_rating;
    ELSE
        -- If it doesn't exist, create it with the new name
        ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS min_profile_rating INTEGER DEFAULT 0 CHECK (min_profile_rating >= 0 AND min_profile_rating <= 100);
    END IF;
END $$;

-- Rename indexes
ALTER INDEX IF EXISTS idx_users_bio_rating RENAME TO idx_users_profile_rating;

-- Update comments
COMMENT ON COLUMN users.profile_rating IS 'Profile completeness rating (0-100%)';
COMMENT ON COLUMN user_settings.profile_rating_minimum IS 'Minimum profile rating percentage required for matches';
COMMENT ON COLUMN user_settings.min_profile_rating IS 'Minimum profile rating percentage required for matches';
