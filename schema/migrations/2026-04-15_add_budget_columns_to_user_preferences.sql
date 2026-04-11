-- Add missing budget TEXT columns to user_preferences table
-- These are for backward compatibility with existing dropdown UI
-- Date: 2026-04-15

-- Add shopping_budget_preference column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'shopping_budget_preference'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN shopping_budget_preference TEXT;
    END IF;
END $$;

-- Add self_care_budget_preference column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'self_care_budget_preference'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN self_care_budget_preference TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.shopping_budget_preference IS 'Shopping budget preference text (e.g., Under $100/mo)';
COMMENT ON COLUMN user_preferences.self_care_budget_preference IS 'Self-care budget preference text (e.g., Under $50/mo)';

-- Migrate any existing data from user_settings if user_preferences is empty
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_preferences LIMIT 1) THEN
        INSERT INTO user_preferences (
            user_id,
            shopping_budget_preference,
            self_care_budget_preference
        )
        SELECT
            user_id,
            shopping_budget_preference,
            self_care_budget_preference
        FROM user_settings
        WHERE shopping_budget_preference IS NOT NULL 
           OR self_care_budget_preference IS NOT NULL
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;
