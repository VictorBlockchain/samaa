-- Change languages_preference from TEXT to TEXT[] for multi-select support
-- Date: 2026-04-15

-- ============================================================================
-- 1. ALTER COLUMN TYPE
-- ============================================================================

ALTER TABLE user_preferences
ALTER COLUMN languages_preference TYPE TEXT[]
USING CASE 
  WHEN languages_preference IS NULL THEN NULL
  WHEN languages_preference = '' THEN ARRAY[]::TEXT[]
  ELSE STRING_TO_ARRAY(languages_preference, ',')
END;

-- ============================================================================
-- 2. ADD COMMENT
-- ============================================================================

COMMENT ON COLUMN user_preferences.languages_preference IS 'Spoken languages (array for multi-select)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
