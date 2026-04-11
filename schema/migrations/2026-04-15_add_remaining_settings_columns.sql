-- Add remaining missing columns to user_settings table
-- These are needed for complete settings pre-population
-- Date: 2026-04-15

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS prayer_frequency TEXT,
ADD COLUMN IF NOT EXISTS hijab_preference TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS willing_to_relocate TEXT,
ADD COLUMN IF NOT EXISTS travel_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS show_age BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_last_seen BOOLEAN DEFAULT FALSE;
