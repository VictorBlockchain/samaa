-- Set default values for available_leads and available_views
-- This ensures new users start with 0 and can be credited after email verification

-- Add columns if they don't exist (for fresh setups)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS available_leads INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_views INTEGER DEFAULT 0;

-- Set default values for existing users who have NULL
UPDATE users 
SET 
  available_leads = COALESCE(available_leads, 0),
  available_views = COALESCE(available_views, 0)
WHERE 
  available_leads IS NULL OR available_views IS NULL;
