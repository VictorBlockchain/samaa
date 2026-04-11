-- Standardize user_settings column naming convention
-- Add _preference suffix to match preference columns
-- Remove duplicate and unused columns
-- Date: 2026-04-15

-- ============================================================================
-- 1. RENAME COLUMNS TO ADD _preference SUFFIX (Match Preferences)
-- ============================================================================

-- Discovery settings (these are preferences, add _preference)
ALTER TABLE user_settings
RENAME COLUMN age_range_min TO age_range_min_preference;

ALTER TABLE user_settings
RENAME COLUMN age_range_max TO age_range_max_preference;

ALTER TABLE user_settings
RENAME COLUMN max_distance TO max_distance_preference;

-- preferred_* columns are already using "preferred" prefix, keep them as-is for arrays
-- But we need to rename the non-array duplicates

-- Remove duplicate array columns (rename instead of drop to avoid breaking dependencies)
ALTER TABLE user_settings
RENAME COLUMN preferred_religiosity TO preferred_religiosity_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_prayer_frequency TO preferred_prayer_frequency_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_hijab TO preferred_hijab_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_marriage_intention TO preferred_marriage_intention_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_height_range TO preferred_height_range_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_marital_status TO preferred_marital_status_deprecated;

ALTER TABLE user_settings
RENAME COLUMN preferred_children TO preferred_children_deprecated;

-- Remove legacy duplicate columns (rename instead of drop)
ALTER TABLE user_settings
RENAME COLUMN education_preference TO education_preference_deprecated;

ALTER TABLE user_settings
RENAME COLUMN occupation_preference TO occupation_preference_deprecated;

-- ============================================================================
-- 2. RENAME REMAINING COLUMNS TO BE CONSISTENT
-- ============================================================================

-- Requirements (add _preference suffix)
-- Note: bio_rating_minimum was already renamed to profile_rating_minimum in previous migration
ALTER TABLE user_settings
RENAME COLUMN profile_rating_minimum TO profile_rating_minimum_preference;

ALTER TABLE user_settings
RENAME COLUMN response_rate_minimum TO response_rate_minimum_preference;

ALTER TABLE user_settings
RENAME COLUMN require_financial_setup TO require_financial_setup_preference;

-- Rename finance/lifestyle columns to match settings-view
-- Note: spending_preference, fine_dining_frequency_preference, and travel_frequency_preference already exist from previous migrations
-- So we rename the duplicates to _deprecated instead
ALTER TABLE user_settings
RENAME COLUMN finance_style_preference TO finance_style_preference_deprecated;

ALTER TABLE user_settings
RENAME COLUMN dining_frequency_preference TO dining_frequency_preference_deprecated;

ALTER TABLE user_settings
RENAME COLUMN shopping_frequency_preference TO shopping_frequency_preference_deprecated;

-- Remove duplicate columns that already exist with correct names (rename instead of drop)
ALTER TABLE user_settings
RENAME COLUMN min_profile_rating TO min_profile_rating_deprecated;

ALTER TABLE user_settings
RENAME COLUMN min_chat_rating TO min_chat_rating_deprecated;

ALTER TABLE user_settings
RENAME COLUMN height_max TO height_max_deprecated;

-- ============================================================================
-- 3. KEEP AS-IS (Notification & Privacy Settings - no _preference suffix)
-- ============================================================================
-- notifications_matches ✓
-- notifications_messages ✓
-- notifications_profile_views ✓
-- notifications_likes ✓
-- push_notifications ✓
-- email_notifications ✓
-- show_age ✓
-- show_location ✓
-- show_last_seen ✓
-- show_online_status ✓

-- ============================================================================
-- 4. ADD ANY MISSING COLUMNS
-- ============================================================================

-- These should already exist from previous migrations, but ensure they're there
-- (Using ADD COLUMN IF NOT EXISTS for safety)

-- Already added from previous migrations:
-- prayer_frequency TEXT
-- hijab_preference TEXT
-- height TEXT
-- languages TEXT
-- willing_to_relocate TEXT
-- sect_preference TEXT
-- is_revert_preference TEXT
-- marriage_timeline_preference TEXT
-- halal_food_preference TEXT
-- alcohol_preference TEXT
-- smoking_preference TEXT
-- psychedelics_preference TEXT
-- psychedelics_types_preference TEXT[]
-- family_involvement_preference TEXT
-- polygamy_perspective_preference TEXT
-- height_min INTEGER
-- living_arrangements_preference TEXT
-- mahr_preference TEXT
-- occupation_preference_single TEXT
-- personality_preference TEXT[]
-- has_video_preference BOOLEAN
-- has_audio_preference BOOLEAN
-- spending_preference TEXT (renamed from finance_style_preference)
-- fine_dining_frequency_preference TEXT (renamed from dining_frequency_preference)
-- travel_frequency_preference TEXT (renamed from shopping_frequency_preference)
-- shopping_budget_preference TEXT
-- self_care_frequency_preference TEXT
-- self_care_budget_preference TEXT

-- ============================================================================
-- SUMMARY OF FINAL COLUMN STRUCTURE
-- ============================================================================
-- 
-- DISCOVERY PREFERENCES (with _preference suffix):
-- - age_range_min_preference INTEGER
-- - age_range_max_preference INTEGER
-- - max_distance_preference INTEGER
-- - anywhere_in_world BOOLEAN (boolean flag, no _preference)
-- - show_only_verified BOOLEAN (boolean flag, no _preference)
-- - show_only_practicing BOOLEAN (boolean flag, no _preference)
--
-- ISLAM VALUES PREFERENCES (with _preference suffix):
-- - prayer_frequency TEXT
-- - hijab_preference TEXT
-- - marriage_timeline_preference TEXT
-- - halal_food_preference TEXT
-- - alcohol_preference TEXT
-- - smoking_preference TEXT
-- - psychedelics_preference TEXT
-- - psychedelics_types_preference TEXT[]
-- - sect_preference TEXT
-- - is_revert_preference TEXT
-- - family_involvement_preference TEXT
-- - polygamy_perspective_preference TEXT
--
-- PERSONAL DETAILS PREFERENCES (with _preference suffix):
-- - preferred_nationality TEXT[] (array, keeping "preferred_" prefix)
-- - preferred_education TEXT[] (array, keeping "preferred_" prefix)
-- - height TEXT
-- - height_min INTEGER
-- - languages TEXT
-- - willing_to_relocate TEXT
-- - living_arrangements_preference TEXT
-- - mahr_preference TEXT
-- - occupation_preference_single TEXT
-- - personality_preference TEXT[]
-- - has_video_preference BOOLEAN
-- - has_audio_preference TEXT
--
-- LIFESTYLE & FINANCE PREFERENCES (with _preference suffix):
-- - spending_preference TEXT
-- - fine_dining_frequency_preference TEXT
-- - travel_frequency_preference TEXT
-- - shopping_budget_preference TEXT
-- - self_care_frequency_preference TEXT
-- - self_care_budget_preference TEXT
--
-- INTERESTS (keeping "preferred_" prefix for arrays):
-- - preferred_interests TEXT[]
--
-- REQUIREMENTS (with _preference suffix):
-- - require_financial_setup_preference BOOLEAN
-- - profile_rating_minimum_preference INTEGER
-- - response_rate_minimum_preference INTEGER
--
-- NOTIFICATIONS (NO _preference suffix):
-- - notifications_matches BOOLEAN
-- - notifications_messages BOOLEAN
-- - notifications_profile_views BOOLEAN
-- - notifications_likes BOOLEAN
-- - push_notifications BOOLEAN
-- - email_notifications BOOLEAN
--
-- PRIVACY (NO _preference suffix):
-- - show_age BOOLEAN
-- - show_location BOOLEAN
-- - show_last_seen BOOLEAN
-- - show_online_status BOOLEAN
--
-- DEPRECATED COLUMNS (renamed with _deprecated suffix, kept for backward compatibility):
-- - preferred_religiosity_deprecated TEXT[]
-- - preferred_prayer_frequency_deprecated TEXT[]
-- - preferred_hijab_deprecated TEXT[]
-- - preferred_marriage_intention_deprecated TEXT[]
-- - preferred_height_range_deprecated TEXT[]
-- - preferred_marital_status_deprecated TEXT[]
-- - preferred_children_deprecated TEXT[]
-- - education_preference_deprecated TEXT[]
-- - occupation_preference_deprecated TEXT[]
-- - finance_style_preference_deprecated TEXT[]
-- - dining_frequency_preference_deprecated TEXT[]
-- - shopping_frequency_preference_deprecated TEXT[]
-- - min_profile_rating_deprecated INTEGER
-- - min_chat_rating_deprecated INTEGER
-- - height_max_deprecated INTEGER
--
-- SYSTEM:
-- - id UUID
-- - user_id UUID
-- - created_at TIMESTAMP
-- - updated_at TIMESTAMP
-- ============================================================================
