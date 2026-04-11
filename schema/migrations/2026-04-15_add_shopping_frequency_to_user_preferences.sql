-- Add shopping_frequency column to user_preferences table
-- Date: 2026-04-15

-- Add shopping_frequency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'shopping_frequency_preference'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN shopping_frequency_preference TEXT;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN user_preferences.shopping_frequency_preference IS 'Preferred shopping frequency (e.g., Rarely, Monthly, Weekly)';

-- Migrate existing data from user_settings if user_preferences is empty
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_preferences LIMIT 1) THEN
        INSERT INTO user_preferences (
            user_id,
            shopping_frequency_preference
        )
        SELECT
            user_id,
            shopping_frequency_preference
        FROM user_settings
        WHERE shopping_frequency_preference IS NOT NULL
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;
