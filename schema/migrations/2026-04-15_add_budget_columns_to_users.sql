-- Add budget and frequency columns to users table for profile setup
-- These columns store the user's own budget preferences (not match preferences)
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD COLUMNS TO users TABLE
-- ============================================================================

-- Shopping budget
ALTER TABLE users
ADD COLUMN IF NOT EXISTS shopping_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS shopping_budget_preference_type TEXT CHECK (shopping_budget_preference_type IN ('less_than', 'greater_than')),
ADD COLUMN IF NOT EXISTS shopping_budget_preference_amount INTEGER;

-- Self-care budget
ALTER TABLE users
ADD COLUMN IF NOT EXISTS self_care_frequency_preference TEXT,
ADD COLUMN IF NOT EXISTS self_care_budget_preference_type TEXT CHECK (self_care_budget_preference_type IN ('less_than', 'greater_than')),
ADD COLUMN IF NOT EXISTS self_care_budget_preference_amount INTEGER;

-- Languages (multi-select)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- ============================================================================
-- 2. ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.shopping_frequency_preference IS 'How often user shops';
COMMENT ON COLUMN users.shopping_budget_preference_type IS 'Shopping budget type: less_than or greater_than';
COMMENT ON COLUMN users.shopping_budget_preference_amount IS 'Shopping budget amount';
COMMENT ON COLUMN users.self_care_frequency_preference IS 'How often user does self-care';
COMMENT ON COLUMN users.self_care_budget_preference_type IS 'Self-care budget type: less_than or greater_than';
COMMENT ON COLUMN users.self_care_budget_preference_amount IS 'Self-care budget amount';
COMMENT ON COLUMN users.languages IS 'Spoken languages (array for multi-select)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
