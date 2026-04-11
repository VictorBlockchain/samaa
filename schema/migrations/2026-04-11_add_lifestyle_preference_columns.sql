-- Add missing preference columns to user_settings for matchmaking algorithm
-- Date: 2026-04-11

-- Lifestyle & Finance preference columns
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS finance_style_preference TEXT[],
ADD COLUMN IF NOT EXISTS dining_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS travel_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS shopping_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS self_care_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS self_care_budget_preference TEXT;

-- Islamic values preference columns
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS alcohol_preference TEXT,
ADD COLUMN IF NOT EXISTS smoking_preference TEXT,
ADD COLUMN IF NOT EXISTS psychedelics_preference TEXT,
ADD COLUMN IF NOT EXISTS halal_food_preference TEXT,
ADD COLUMN IF NOT EXISTS sect_preference TEXT,
ADD COLUMN IF NOT EXISTS is_revert_preference TEXT;

-- Family preference columns
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS has_children_preference TEXT,
ADD COLUMN IF NOT EXISTS want_children_preference TEXT;

-- Height preference columns
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS height_min INTEGER,
ADD COLUMN IF NOT EXISTS height_max INTEGER;

-- Min ratings (may already exist from another migration, IF NOT EXISTS is safe)
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS min_profile_rating INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_chat_rating INTEGER DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN user_settings.finance_style_preference IS 'Preferred finance style of matches';
COMMENT ON COLUMN user_settings.dining_frequency_preference IS 'Preferred dining out frequency of matches';
COMMENT ON COLUMN user_settings.travel_frequency_preference IS 'Preferred travel frequency of matches';
COMMENT ON COLUMN user_settings.shopping_frequency_preference IS 'Preferred shopping frequency of matches';
COMMENT ON COLUMN user_settings.self_care_frequency_preference IS 'Preferred self-care frequency of matches';
COMMENT ON COLUMN user_settings.self_care_budget_preference IS 'Preferred self-care budget range of matches';
COMMENT ON COLUMN user_settings.alcohol_preference IS 'Preferred alcohol stance of matches';
COMMENT ON COLUMN user_settings.smoking_preference IS 'Preferred smoking stance of matches';
COMMENT ON COLUMN user_settings.psychedelics_preference IS 'Preferred psychedelics stance of matches';
COMMENT ON COLUMN user_settings.halal_food_preference IS 'Preferred halal food stance of matches';
COMMENT ON COLUMN user_settings.sect_preference IS 'Preferred Islamic sect of matches';
COMMENT ON COLUMN user_settings.is_revert_preference IS 'Preferred revert status of matches';
COMMENT ON COLUMN user_settings.has_children_preference IS 'Preferred children status of matches';
COMMENT ON COLUMN user_settings.want_children_preference IS 'Preferred wants-children status of matches';
COMMENT ON COLUMN user_settings.height_min IS 'Minimum height preference in cm';
COMMENT ON COLUMN user_settings.height_max IS 'Maximum height preference in cm';
